using Domain.Entities;
using Domain.Enums;

namespace Feature.NotificationFeature.NotificationStrategies;

public interface INotificationStrategy
{
    List<AppEvent> CanHandle { get; }

    Task<List<Guid>> GetMemberIdsToNotify(Event evnt);
}
