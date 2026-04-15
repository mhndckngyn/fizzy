using Domain.Common;

namespace Domain.Entities;

public class CardAssignment : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;

    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;

    // Người được assign
    public Guid AssigneeMemberId { get; set; }
    public Member Assignee { get; set; } = null!;

    // Người thực hiện assign
    public Guid AssignerMemberId { get; set; }
    public Member Assigner { get; set; } = null!;
}
