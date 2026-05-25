using System.Text.Json.Serialization;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;
using Feature.NotificationFeature;

namespace Feature.EventFeature;

public static class FeedEventMapper
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    internal enum FeedEventType
    {
        Added = 1,
        Updated = 2,
        Done = 3,
    }

    internal sealed record FeedEvent(
        Guid EventId,
        Guid CardId,
        int CardNo,
        string Title,
        string BoardName,
        string CreatorName,
        string? ColumnColor,
        DateTime CreatedAt,
        FeedEventType Type
    );

    internal static FeedEvent MapToFeedEvent(
        Event e,
        Guid requesterMemberId,
        IDictionary<Guid, string> nameMap
    ) =>
        new(
            e.Id,
            e.CardId,
            e.Card.No,
            GetEventTitle(e, requesterMemberId, nameMap),
            e.Card.Board.Name,
            e.CreatorMember.Name,
            e.Card.Column?.Color,
            e.CreatedAt,
            ToFeedEventType(e.AppEventType)
        );

    internal static string GetEventTitle(
        Event e,
        Guid requesterMemberId,
        IDictionary<Guid, string> nameMap
    )
    {
        string creator = e.CreatorMemberId == requesterMemberId ? "You" : e.CreatorMember.Name;
        string cardTitle = e.Card.Title ?? "a card";
        return e.AppEventType switch
        {
            AppEvent.CardCreate => $"{creator} added {cardTitle}",
            AppEvent.CardDone => $"{creator} moved {cardTitle} to 'Done'",
            AppEvent.CardReopened => $"{creator} reopened {cardTitle}",
            AppEvent.CardPostponed => $"{creator} moved {cardTitle} to 'Not Now'",
            AppEvent.CardResumed => $"{creator} moved {cardTitle} to {ColumnName(e)}",
            AppEvent.CardToMaybe => $"{creator} moved {cardTitle} back to 'Maybe'",
            AppEvent.CardColumnChange => $"{creator} moved {cardTitle} to {ColumnName(e)}",
            AppEvent.CardBoardChange => $"{creator} moved {cardTitle} to {DestinationBoardName(e)}",
            AppEvent.CommentCreate => $"{creator} commented on {cardTitle}",
            AppEvent.CardAssign or AppEvent.CardUnassign => AssignmentTitle(
                e,
                creator,
                cardTitle,
                requesterMemberId,
                nameMap
            ),
            AppEvent.CardTitleChanged => $"Renamed by {creator}", // should not show
            AppEvent.Mention => $"{creator} mentioned you", // should not show
            _ => "A change was made to this card",
        };
    }

    private static string AssignmentTitle(
        Event e,
        string creator,
        string cardTitle,
        Guid requesterId,
        IDictionary<Guid, string> nameMap
    )
    {
        bool isAssign = e.AppEventType == AppEvent.CardAssign;
        Guid? id = isAssign
            ? e.GetMetadata<CardAssignMetadata>()?.AssignedMemberId
            : e.GetMetadata<CardUnassignMetadata>()?.UnassignedMemberId;
        string recipient = id.HasValue ? AssigneeName(nameMap, requesterId, id.Value) : "someone";
        return isAssign
            ? $"{creator} assigned {recipient} to \"{cardTitle}\""
            : $"{creator} unassigned {recipient} from \"{cardTitle}\"";

        static string AssigneeName(
            IDictionary<Guid, string> nameMap,
            Guid requesterId,
            Guid assigneeId
        )
        {
            if (requesterId == assigneeId)
                return "yourself";
            return nameMap.TryGetValue(assigneeId, out var name) ? name : "someone";
        }
    }

    private static FeedEventType ToFeedEventType(AppEvent appEvent) =>
        appEvent switch
        {
            AppEvent.CardCreate or AppEvent.CardReopened => FeedEventType.Added,
            AppEvent.CardDone => FeedEventType.Done,
            _ => FeedEventType.Updated,
        };

    private static string ColumnName(Event e) =>
        e.GetMetadata<CardMoveToColumnMetadata>()?.ColumnName ?? "another column";

    private static string DestinationBoardName(Event e) =>
        e.GetMetadata<CardMoveBoardMetadata>()?.DestinationBoardName ?? "a different board";
}
