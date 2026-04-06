using Domain.Common;

namespace Domain.Entities;

public class CardContent : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public string? Body { get; set; }
}
