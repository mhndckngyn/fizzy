using System.Text.Json;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;

namespace Feature.NotificationFeature.NotificationStrategies;

public class AssignStrategy : INotificationStrategy
{
    public List<AppEvent> CanHandle { get; } = [AppEvent.CardAssign];

    public Task<List<Guid>> GetMemberIdsToNotify(Event evnt)
    {
        List<Guid> memberIds = [];

        CardAssignMetadata? data = JsonSerializer.Deserialize<CardAssignMetadata>(evnt.Metadata);
        if (
            data != null
            && data.AssignedMemberId != Guid.Empty
            && evnt.CreatorMemberId != data.AssignedMemberId
        )
        {
            memberIds.Add(data.AssignedMemberId);
        }

        return Task.FromResult(memberIds);
    }
}
