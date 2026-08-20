using System.ComponentModel.DataAnnotations;
using RabbitMQ.Client;

namespace Feature.BackgroundServices.AuthEventHandler;

public class RabbitMqOptions
{
    public const string SectionName = "RabbitMq:UserDelete";

    [Required]
    public string HostName { get; set; } = "localhost";

    [Range(1, 65535)]
    public int Port { get; set; } = AmqpTcpEndpoint.UseDefaultPort;

    [Required]
    public string UserName { get; set; } = "guest";

    [Required]
    public string Password { get; set; } = "guest";

    [Required]
    public string VirtualHost { get; set; } = "/";

    [Required]
    public string ExchangeName { get; set; } = "auth_events";

    [Required]
    public string QueueName { get; set; } = "auth_events_handler";

    [Required]
    public string RoutingKey { get; set; } = "user.deleted";

    [Range(1, int.MaxValue)]
    public int DeliveryLimit { get; set; } = 5;
}
