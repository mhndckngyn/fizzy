using Domain.Common;

namespace Domain.Entities;

public class Notification : BaseEntity
{
    public int CardNo { get; }
    public string BoardName { get; } = string.Empty;

    public string Title { get; } = string.Empty;

    public string Message { get; } = string.Empty;

    public string SenderName { get; } = string.Empty;

    public NotificationType NotificationType { get; }

    private readonly List<NotificationMember> _notificationMembers = [];
    public IReadOnlyCollection<NotificationMember> NotificationMembers =>
        _notificationMembers.AsReadOnly();

    public Notification(
        int cardNo,
        string boardName,
        string title,
        string message,
        string senderName,
        NotificationType notificationType
    )
    {
        CardNo = cardNo;
        BoardName = boardName;
        Title = title;
        Message = message;
        SenderName = senderName;
        NotificationType = notificationType;
    }

    public void AddMember(Guid userId) =>
        _notificationMembers.Add(new NotificationMember(Id, userId));
}
