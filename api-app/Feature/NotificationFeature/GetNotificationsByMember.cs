using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature;

public static class GetNotificationsByMember
{
    internal sealed record GetNotificationsResponse(
        List<NotificationMapper.NotificationDto> Notifications
    );

    // Query
    internal sealed record GetNotificationQuery(Guid UserId, Guid TeamId)
        : IRequest<Result<GetNotificationsResponse>>;

    internal sealed class GetNotificationsHandler(AppDbContext dbContext)
        : IRequestHandler<GetNotificationQuery, Result<GetNotificationsResponse>>
    {
        public async Task<Result<GetNotificationsResponse>> Handle(
            GetNotificationQuery request,
            CancellationToken cancellationToken
        )
        {
            Member? member = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (member is null)
            {
                return Result.Fail("User does not belong to this team.");
            }

            List<Notification> notifications = await dbContext
                .Notifications.Where(n =>
                    n.TeamId == request.TeamId && n.RecipientMemberId == member.Id
                )
                .Include(n => n.Event)
                    .ThenInclude(e => e.Card)
                        .ThenInclude(c => c.Board)
                .Include(n => n.Event)
                    .ThenInclude(e => e.Card)
                        .ThenInclude(c => c.Column)
                .Include(n => n.Event)
                    .ThenInclude(e => e.CreatorMember)
                .Include(n => n.RecipientMember)
                .OrderByDescending(n => n.UpdatedAt)
                .ToListAsync(cancellationToken);

            List<NotificationMapper.NotificationDto> dtos = notifications
                .Select(NotificationMapper.MapToDto)
                .ToList();

            return Result.Ok(new GetNotificationsResponse(dtos));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "api/teams/{teamId:guid}/notifications",
                    async (ClaimsPrincipal user, ISender sender, Guid teamId) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        GetNotificationQuery query = new(userId.Value, teamId);
                        Result<GetNotificationsResponse> result = await sender.Send(query);

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
