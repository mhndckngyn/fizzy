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

    /// <summary>
    /// Team-level fallback for the auto-close period in days.
    /// Defaults to 30 days. Individual boards can override this value.
    /// Valid values: see <see cref="Domain.Constants.AutoClosePolicy.ValidPeriodDays"/>.
    /// </summary>
    public int AutoClosePeriodDays { get; set; } = 30;
}
