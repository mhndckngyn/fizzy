using Domain.Common;

namespace Domain.Entities;

public class Tag : BaseEntity
{
    public Guid TeamId { get; set; }
    public Team Team { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Color { get; set; } = "#6b7280";

    public ICollection<CardTag> CardTags { get; set; } = [];
}
