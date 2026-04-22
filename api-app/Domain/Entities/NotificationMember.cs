using Domain.Common;

namespace Domain.Entities;

public class NotificationMember : BaseEntity
{
    public Guid NotificationId { get; }
    public Guid RecepientMemberId { get; }
    public bool IsRead { get; private set; }

    public NotificationMember(Guid notificationId, Guid recepientMemberId)
    {
        NotificationId = notificationId;
        RecepientMemberId = recepientMemberId;
    }

    public void MarkAsRead() => IsRead = true;

    public void MarkAsUnread() => IsRead = false;
}
