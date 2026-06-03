using System.Security.Claims;
using Carter;
using Feature.Extensions;
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
            var notification = await dbContext
                .Notifications.Include(n => n.RecipientMember)
                .FirstOrDefaultAsync(
                    n =>
                        n.Id == request.NotificationId
                        && n.RecipientMember.UserId == request.UserId,
                    cancellationToken
                );

            if (notification is null)
                return Result.Fail(
                    new Error("Notification not found.").WithMetadata("HttpCode", 404)
                );

            notification.ReadAt = DateTime.UtcNow;
            notification.UnreadCount = 0;

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
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new ReadNotificationCommand(id, userId.Value)
                        );

                        return result.ToNoContentMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
