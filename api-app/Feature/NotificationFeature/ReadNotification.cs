using System.Security.Claims;
using Carter;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature;

public static class ReadNotification
{
    internal sealed record ReadNotificationCommand(Guid NotificationId, Guid UserId)
        : IRequest<Result>;

    internal sealed class ReadNotificationHandler(AppDbContext dbContext)
        : IRequestHandler<ReadNotificationCommand, Result>
    {
        public async Task<Result> Handle(
            ReadNotificationCommand request,
            CancellationToken cancellationToken
        )
        {
            var notificationMember = await dbContext.NotificationMembers.FirstOrDefaultAsync(
                nm =>
                    nm.NotificationId == request.NotificationId
                    && nm.RecepientMemberId == request.UserId,
                cancellationToken
            );

            if (notificationMember is null)
            {
                return Result.Fail("Notification not found for the user.");
            }

            if (notificationMember.IsRead)
            {
                return Result.Ok();
            }

            notificationMember.MarkAsRead();

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch(
                    "api/notifications/{id:guid}/read",
                    async (Guid id, ClaimsPrincipal user, ISender sender) =>
                    {
                        // Extract userId
                        var userIdString = user.FindFirstValue(ClaimTypes.NameIdentifier);
                        if (
                            string.IsNullOrEmpty(userIdString)
                            || !Guid.TryParse(userIdString, out var userId)
                        )
                        {
                            return Results.Unauthorized();
                        }

                        var command = new ReadNotificationCommand(id, userId);

                        var result = await sender.Send(command);

                        if (!result.IsSuccess)
                        {
                            return Results.NotFound(
                                new { errors = result.Errors.Select(e => e.Message) }
                            );
                        }

                        return Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
