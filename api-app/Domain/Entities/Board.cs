using Domain.Common;

namespace Domain.Entities;

public class Board : BaseEntity
{
    public required string Name { get; set; }
    public bool AllAccess { get; set; } = true;
    public Guid TeamId { get; set; }
    public Team Team { get; set; } = null!;
    public Guid CreatorMemberId { get; set; }
    public Member Creator { get; set; } = null!;
    public ICollection<Card> Cards { get; set; } = new List<Card>();

    public ICollection<BoardAccess> BoardAccesses { get; set; } = new List<BoardAccess>();
}
