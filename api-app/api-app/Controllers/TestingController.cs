using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api_app.Controllers;

[ApiController]
[Route("api/test")]
public class TestingController : Controller
{

    [HttpGet("secure-ping")]
    [Authorize] // This triggers the JWKS validation
    public IActionResult SecurePing()
    {
        return Ok(new
        {
            message = "JWKS Verification Successful!",
            user = User.Identity?.Name,
            claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }
}
