using Domain.Common;

namespace Domain.Entities;

public class CardWatch : BaseEntity
{
    public CardWatch(Guid teamId, Guid cardId, Guid memberId)
    {
        TeamId = teamId;
        CardId = cardId;
        MemberId = memberId;
    }

    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public Guid CardId { get; set; }

    public Card Card { get; set; } = null!;

    public Guid MemberId { get; set; }

    public Member Member { get; set; } = null!;

    public bool Watching { get; set; } = true;
}
