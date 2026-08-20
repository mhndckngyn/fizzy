using System.ComponentModel.DataAnnotations;

namespace Feature.Options;

public class AuthApiOptions
{
    public const string SectionName = "AuthApi";

    [Required, Url]
    public string BaseUrl { get; set; } = "";

    [Required, Url]
    public string JwksUrl { get; set; } = "";

    [Required, Url]
    public string Issuer { get; set; } = "";

    [Required, Url]
    public string Audience { get; set; } = "";
}
