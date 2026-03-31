using Domain.Common;

namespace Domain.Entities;

public class CardDone : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;
}
