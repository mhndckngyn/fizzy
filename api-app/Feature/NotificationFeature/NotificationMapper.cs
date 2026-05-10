using System.Runtime.InteropServices;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;

namespace Feature.NotificationFeature;

public static class NotificationMapper
{
    internal sealed record NotificationDto(
        Guid NotificationId,
        Guid TeamId,
        string Title, // Event.Card.Title
        string Description, // Event.Type && Event.Metadata
        string ActorName, // Event.CreatorMember
        int CardNo, // Event.Card.CardNo
        string BoardName, // Event.Card.Board.Name
        Guid? ColumnId, // Event.Card.ColumnId (for columnColor)
        int UnreadCount, // UnreadCount
        DateTime? ReadAt, // ReadAt
        DateTime? UpdatedAt // UpdatedAt
    );

    internal static NotificationDto MapToDto(Notification n) =>
        new(
            n.Id,
            n.TeamId,
            n.Event.Card.Title ?? "",
            GetNotificationDescription(n),
            n.Event.CreatorMember.Name,
            n.Event.Card.No,
            n.Event.Card.Board.Name,
            n.Event.Card.ColumnId,
            n.UnreadCount,
            n.ReadAt,
            n.UpdatedAt
        );

    public static string GetNotificationDescription(Notification n)
    {
        string creator = n.Event.CreatorMember.Name;
        return n.Event.AppEventType switch
        {
            AppEvent.CardCreate => $"Added by {creator}",
            AppEvent.CardDone => $"Moved to Done by {creator}",
            AppEvent.CardReopened => $"Moved to {ColumnName(n.Event)} by {creator}",
            AppEvent.CardPostponed => $"Moved to Not Now by {creator}",
            AppEvent.CardResumed => $"Moved to {ColumnName(n.Event)} by {creator}",
            AppEvent.CardToMaybe => $"Moved back to Maybe by {creator}",
            AppEvent.CardColumnChange => $"Moved to {ColumnName(n.Event)} by {creator}",
            AppEvent.CardBoardChange => $"Changed board by {creator}",
            AppEvent.CardTitleChanged => $"Renamed by {creator}",
            AppEvent.CardUnassign => $"{UnassignedName(n.Event)} unassigned by {creator}",
            AppEvent.CardAssign => $"Assigned to {n.RecipientMember.Name}",
            AppEvent.CommentCreate => $"Comment added by {creator}",
            AppEvent.Mention => $"{creator} mentioned you",
            _ => $"A change was made to this card",
        };
    }

    private static string ColumnName(Event e) =>
        e.GetMetadata<CardMoveToColumnMetadata>()?.ColumnName ?? "a column";

    private static string UnassignedName(Event e) =>
        e.GetMetadata<CardUnassignMetadata>()?.UnassignedMemberName ?? "A member";
}
