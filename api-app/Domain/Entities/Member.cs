using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Member : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid TeamId { get; set; }

    public required string Name { get; set; }

    public TeamRole Role { get; set; } = TeamRole.Member;

    public User User { get; set; } = null!;

    public Team Team { get; set; } = null!;

    public ICollection<Event> Events { get; set; } = [];
}
