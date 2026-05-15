using Domain.Common;

namespace Domain.Entities;

public class CardTag : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;

    public Guid AddedByMemberId { get; set; }
    public Member AddedBy { get; set; } = null!;
}
