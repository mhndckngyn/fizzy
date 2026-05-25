using Domain.Common;
using Domain.Enums;

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

    /// <summary>
    /// Board-level override for the auto-close period in days.
    /// null = inherit from the team's AutoClosePeriodDays.
    /// </summary>
    public int? AutoClosePeriodDays { get; set; }

    public bool CanBeUpdatedBy(Member member) =>
        member.Role is TeamRole.Owner or TeamRole.Administrator || CreatorMemberId == member.Id;
}
