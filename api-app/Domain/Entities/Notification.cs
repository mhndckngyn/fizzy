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
}
