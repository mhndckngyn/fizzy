using System.Security.Claims;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.UserFeature;
using MediatR;

namespace Feature.Middlewares;

public class UserProvisioner(RequestDelegate next, IUserCache userCache)
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

        CachedUser? cachedUser = await userCache.GetAsync(userId, context.RequestAborted);

        if (cachedUser == null)
        {
            var getResult = await mediator.Send(
                new GetUser.GetUserCommand(userId),
                context.RequestAborted
            );
            User? user = getResult.Value;

            if (user == null)
            {
                var createResult = await mediator.Send(
                    new CreateUser.CreateUserCommand(userId, email),
                    context.RequestAborted
                );
                if (createResult.IsSuccess)
                {
                    await userCache.SetAsync(
                        userId,
                        new CachedUser(DeletedAt: null),
                        context.RequestAborted
                    );
                }
            }
            else
            {
                await userCache.SetAsync(
                    userId,
                    new CachedUser(DeletedAt: user.DeletedAt),
                    context.RequestAborted
                );
            }
        }
        else if (cachedUser.DeletedAt != null)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(
                new FailResponse<string>("User has been deleted.")
            );
            return;
        }

        await next(context);
    }
}
