using Domain.Common;

namespace Domain.Entities;

public class CardNotNow : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;
}
