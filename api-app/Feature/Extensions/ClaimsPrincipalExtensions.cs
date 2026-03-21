using System.Security.Claims;

namespace Feature.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        string? userIdString =
            user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");

        return Guid.TryParse(userIdString, out Guid userId) ? userId : null;
    }
}
