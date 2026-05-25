using Domain.Common;

namespace Domain.Entities;

public class CardGolden : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public Guid TeamId { get; set; }
}
