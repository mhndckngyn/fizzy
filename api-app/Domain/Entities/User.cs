using Domain.Common;

namespace Domain.Entities;

public class User : BaseEntity
{
    public required string EmailAddress { get; set; }
}
