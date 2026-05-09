using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public partial class Event : BaseEntity
{
    public AppEvent AppEventType { get; set; }

    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public Guid CreatorMemberId { get; set; }

    public Member CreatorMember { get; set; } = null!;

    public Guid CardId { get; set; }

    public Card Card { get; set; } = null!;

    public string Metadata { get; set; } // JSON string

    public Event(
        AppEvent appEventType,
        Guid teamId,
        Guid creatorMemberId,
        Guid cardId,
        string metadata = "{}"
    )
    {
        AppEventType = appEventType;
        TeamId = teamId;
        CreatorMemberId = creatorMemberId;
        CardId = cardId;
        Metadata = metadata;
    }
}
