using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration;

namespace Infrastructure;

public class EfCoreOptions
{
    public const string SectionName = "ConnectionStrings";

    [Required]
    [ConfigurationKeyName("DefaultConnection")]
    public string ConnectionString { get; set; } = "";
}
