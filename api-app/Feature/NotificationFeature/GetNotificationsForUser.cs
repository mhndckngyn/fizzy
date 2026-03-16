using System.Security.Claims;
using Carter;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature;

public static class GetNotificationsForUser
{
    // Response
    internal sealed record NotificationResponse(
        Guid Id,
        string Title,
        string Message,
        string BoardName,
        DateTime CreatedAt,
        string SenderName,
        int CardNo,
        Guid RecipientUserId,
        bool IsRead
    );

    // Query
    internal sealed record GetNotificationQuery(Guid UserId)
        : IRequest<Result<List<NotificationResponse>>>;

    internal sealed class GetNotificationsHandler(AppDbContext dbContext)
        : IRequestHandler<GetNotificationQuery, Result<List<NotificationResponse>>>
    {
        public async Task<Result<List<NotificationResponse>>> Handle(
            GetNotificationQuery request,
            CancellationToken cancellationToken
        )
        {
            var notifications = await dbContext
                .Notifications.AsNoTracking()
                .Where(n => n.NotificationMembers.Any(nm => nm.RecepientMemberId == request.UserId))
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponse(
                    n.Id,
                    n.Title,
                    n.Message,
                    n.BoardName,
                    n.CreatedAt,
                    n.SenderName,
                    n.CardNo,
                    request.UserId,
                    n.NotificationMembers.First(nm => nm.RecepientMemberId == request.UserId).IsRead
                ))
                .ToListAsync(cancellationToken);

            return Result.Ok(notifications);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "api/notifications",
                    async (ClaimsPrincipal user, ISender sender) =>
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

                        var query = new GetNotificationQuery(userId);
                        var result = await sender.Send(query);

                        if (result.IsFailed)
                        {
                            return Results.BadRequest(
                                new { errors = result.Errors.Select(e => e.Message) }
                            );
                        }

                        return Results.Ok(result.Value);
                    }
                )
                .RequireAuthorization();
        }
    }
}
