using Domain.Common;

namespace Domain.Entities;

public class Team : BaseEntity
{
    public required string Name { get; set; }

    public int ExternalTeamId { get; set; }

    public long CardsCount { get; set; } = 0;

    public ICollection<Member> Members { get; set; } = [];

    public string? InvitationId { get; set; }
}
