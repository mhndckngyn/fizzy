using System.Text.Json;
using Domain.AppEventMetadata;
using Domain.Enums;
using Event = Domain.Entities.Event;

namespace Feature.NotificationFeature.NotificationStrategies;

public class MentionStrategy : INotificationStrategy
{
    public AppEvent Type => AppEvent.Mention;

    public List<AppEvent> CanHandle { get; } = [AppEvent.Mention];

    public Task<List<Guid>> GetMemberIdsToNotify(Event evnt)
    {
        List<Guid> memberIds = [];

        CardMentionMetadata? data = JsonSerializer.Deserialize<CardMentionMetadata>(evnt.Metadata);
        if (data?.MentionedMemberIds == null)
        {
            return Task.FromResult(memberIds);
        }

        // TODO should add Mention table so we know who has already been mentioned and notify only new mentions

        // No need to notify when someone mentions themselves
        memberIds.AddRange(
            data.MentionedMemberIds.Where(id => id != Guid.Empty && id != evnt.CreatorMemberId)
        );

        return Task.FromResult(memberIds);
    }
}
