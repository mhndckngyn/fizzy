using Domain.Enums;

namespace Domain.Entities;

public class BoardAccess
{
    public BoardAccess(Guid teamId, Guid boardId, Guid memberId)
    {
        TeamId = teamId;
        BoardId = boardId;
        MemberId = memberId;
    }

    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public Guid BoardId { get; set; }

    public Board Board { get; set; } = null!;

    public BoardInvolvement BoardInvolvement { get; set; } = BoardInvolvement.AccessOnly;

    public Guid MemberId { get; set; }

    public Member Member { get; set; } = null!;
}
