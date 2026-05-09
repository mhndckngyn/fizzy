using Domain.Common;
using Domain.ValueObjects;

namespace Domain.Entities;

public class Team : BaseEntity
{
    public required string Name { get; set; }

    public int ExternalTeamId { get; set; }

    public long CardsCount { get; set; } = 0;

    public ICollection<Member> Members { get; set; } = [];

    public ICollection<Card> Cards { get; set; } = [];

    public ICollection<Event> Events { get; set; } = [];

    public ICollection<Board> Boards { get; set; } = [];

    public InvitationCode? InvitationCode { get; set; }
}
