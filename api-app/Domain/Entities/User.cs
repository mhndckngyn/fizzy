using Domain.Common;

namespace Domain.Entities;

public class User : BaseEntity
{
    public required string EmailAddress { get; set; }

    private readonly List<NotificationMember> _notificationMembers = [];
    public IReadOnlyCollection<NotificationMember> NotificationMembers =>
        _notificationMembers.AsReadOnly();
}
