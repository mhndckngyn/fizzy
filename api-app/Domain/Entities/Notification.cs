using Domain.Common;

namespace Domain.Entities;

public class Notification : BaseEntity
{
    public Notification(Guid teamId, Guid cardId, Guid eventId, Guid recipientMemberId)
    {
        TeamId = teamId;
        CardId = cardId;
        EventId = eventId;
        RecipientMemberId = recipientMemberId;
        UnreadCount = 1;
        ReadAt = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public Guid CardId { get; set; }

    public Card Card { get; set; } = null!;

    public Guid EventId { get; set; }

    public Event Event { get; set; } = null!;

    public int UnreadCount { get; set; }

    public DateTime? ReadAt { get; set; }

    public Guid RecipientMemberId;

    public Member RecipientMember { get; set; } = null!;
}
