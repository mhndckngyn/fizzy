using Domain.Common;

namespace Domain.Entities;

public class User : BaseEntity
{
    public required string EmailAddress { get; set; }

    public DateTime? DeletedAt { get; set; }

    public ICollection<Member> Members { get; set; } = new List<Member>();
}
