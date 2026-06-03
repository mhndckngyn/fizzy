using System.Security.Claims;
using Feature.ApiResponses;
using Feature.UserFeature;
using MediatR;

namespace Feature.Middlewares;

public class UserProvisioner(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IMediator mediator)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await next(context);
            return;
        }

        string? userIdString =
            context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");
        string? email =
            context.User.FindFirstValue(ClaimTypes.Email) ?? context.User.FindFirstValue("email");

        if (string.IsNullOrEmpty(userIdString) || string.IsNullOrEmpty(email))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(
                new FailResponse<string>("UserId or Email claim is missing.")
            );
            return;
        }

        if (!Guid.TryParse(userIdString, out Guid userId))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(
                new FailResponse<string>("UserId claim is not valid.")
            );
            return;
        }

        CreateUser.CreateUserCommand command = new(userId, email);
        await mediator.Send(command, context.RequestAborted);

        await next(context);
    }
}
