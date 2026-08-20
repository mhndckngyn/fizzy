using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration;

namespace Feature.Options;

public class RedisOptions
{
    public const string SectionName = "ConnectionStrings";

    [Required]
    [ConfigurationKeyName("Redis")]
    public string ConnectionString { get; set; } = "";
}
