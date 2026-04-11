using Domain.Common;

namespace Domain.Entities;

public class Column : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Color { get; set; } = null!;
    public Guid BoardId { get; set; }
    public int Position { get; set; }
}
