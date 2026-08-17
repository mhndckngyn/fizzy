using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Hangfire;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Feature.BackgroundServices.AuthEventHandler;

public class UserDeleteReceiverService(
    IBackgroundJobClient backgroundJobClient,
    IOptions<RabbitMqOptions> options,
    ILogger<UserDeleteReceiverService> logger
) : BackgroundService
{
    private IConnection? Connection { get; set; }
    private IChannel? Channel { get; set; }

    private readonly RabbitMqOptions _options = options.Value;

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = _options.HostName,
            Port = _options.Port,
            UserName = _options.UserName,
            Password = _options.Password,
            VirtualHost = _options.VirtualHost,
            AutomaticRecoveryEnabled = true,
            TopologyRecoveryEnabled = true,
        };
        Connection = await factory.CreateConnectionAsync(cancellationToken);
        Channel = await Connection.CreateChannelAsync(null, cancellationToken);
        await Channel.ExchangeDeclareAsync(
            _options.ExchangeName,
            ExchangeType.Topic,
            durable: true,
            cancellationToken: cancellationToken
        );
        await Channel.QueueDeclareAsync(
            queue: _options.QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: new Dictionary<string, object?>
            {
                { "x-queue-type", "quorum" },
                { "x-delivery-limit", _options.DeliveryLimit },
            },
            passive: false,
            noWait: false,
            cancellationToken: cancellationToken
        );
        await Channel.QueueBindAsync(
            _options.QueueName,
            _options.ExchangeName,
            _options.RoutingKey,
            cancellationToken: cancellationToken
        );

        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (Channel == null)
            return;

        var consumer = new AsyncEventingBasicConsumer(Channel);
        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            string jsonStr = Encoding.UTF8.GetString(body);
            try
            {
                var payload = JsonSerializer.Deserialize<MessagePayload>(jsonStr);
                if (payload is null || payload.UserId == Guid.Empty)
                {
                    logger.LogInformation("Processed message with malformed payload.");
                    await Channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
                    return;
                }
                backgroundJobClient.Enqueue<IUserDeletionJob>(p => p.DeleteAsync(payload.UserId));
                await Channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
            }
            catch (Exception ex)
            {
                if (ex is ArgumentNullException or JsonException)
                {
                    logger.LogInformation("Processed message with malformed payload.");
                    await Channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
                }
                else
                {
                    await Channel.BasicNackAsync(
                        ea.DeliveryTag,
                        multiple: false,
                        requeue: true,
                        stoppingToken
                    );
                }
            }
        };

        await Channel.BasicConsumeAsync(
            _options.QueueName,
            autoAck: false,
            consumer,
            cancellationToken: stoppingToken
        );

        await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        await base.StopAsync(cancellationToken);

        if (Channel is not null)
        {
            try
            {
                await Channel.CloseAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to close RabbitMQ channel cleanly.");
            }
            finally
            {
                await Channel.DisposeAsync();
            }

            Channel = null;
        }

        if (Connection is not null)
        {
            try
            {
                await Connection.CloseAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to close RabbitMQ connection cleanly.");
            }
            finally
            {
                await Connection.DisposeAsync();
            }

            Connection = null;
        }
    }

    internal class MessagePayload
    {
        [JsonPropertyName("userId")]
        public Guid UserId { get; set; }

        public string Email { get; set; } = "";
    }
}
