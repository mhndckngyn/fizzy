using Domain.Common;

namespace Domain.Entities;

public class Comment : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public Guid CreatorMemberId { get; set; }
    public Member Creator { get; set; } = null!;
    public string Body { get; set; } = null!;
}
