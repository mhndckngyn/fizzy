using Domain.Common;

namespace Domain.Entities;

public class Pin : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;

    public Guid MemberId { get; set; }
    public Member Member { get; set; } = null!;

    public Guid TeamId { get; set; }
    public Team Team { get; set; } = null!;
}
