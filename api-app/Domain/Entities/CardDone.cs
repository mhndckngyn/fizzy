using Domain.Common;

namespace Domain.Entities;

public class CardDone : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public Guid? ClosedByMemberId { get; set; } // nullable makes sure migration can apply (old records don't have it)
    public Member? ClosedByMember { get; set; }
}
