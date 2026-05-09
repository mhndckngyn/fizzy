namespace Feature.NotificationFeature.NotificationProcessor;

public interface IEventProcessor
{
    Task ProcessEventJob(Guid eventId);
}
