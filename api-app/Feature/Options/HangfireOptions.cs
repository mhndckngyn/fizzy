using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration;

namespace Feature.Options;

public class HangfireOptions
{
    public const string SectionName = "ConnectionStrings";

    [Required]
    [ConfigurationKeyName("DefaultConnection")]
    public string ConnectionString { get; set; } = "";
}
