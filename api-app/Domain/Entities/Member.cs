using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Member : BaseEntity
{
    public Guid? UserId { get; set; }

    public Guid TeamId { get; set; }

    public required string Name { get; set; }

    public TeamRole Role { get; set; } = TeamRole.Member;

    public DateTime? RemovedAt { get; set; }

    public User? User { get; set; }

    public Team Team { get; set; } = null!;

    public ICollection<Event> Events { get; set; } = [];

    public bool CanManageTeam => Role is TeamRole.Owner or TeamRole.Administrator;

    public bool CanManage(Guid targetMemberId, TeamRole targerMemberRole)
    {
        if (Id == targetMemberId)
            return false;

        return Role switch
        {
            TeamRole.Owner => true,
            TeamRole.Administrator => targerMemberRole != TeamRole.Owner,
            _ => false,
        };
    }
}
