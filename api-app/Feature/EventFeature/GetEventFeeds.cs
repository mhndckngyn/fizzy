using System.Security.Claims;
using Carter;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;
using Feature.Extensions;
using Feature.NotificationFeature;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Feature.EventFeature;

public static class GetEventFeeds
{
    internal sealed record GetEventFeedsRequest(DateTime? Date, Guid[] BoardIds, Guid[] MemberIds);

    internal sealed record GetEventFeedsResponse(
        IEnumerable<FeedEventMapper.FeedEvent> FeedEvents,
        string? NextCursor
    );

    internal sealed record GetEventFeedsCommand(
        Guid TeamId,
        Guid UserId,
        DateTime? Date,
        Guid[] BoardIds,
        Guid[] MemberIds
    ) : IRequest<Result<GetEventFeedsResponse>>;

    internal class GetEventFeedsHandler(AppDbContext dbContext)
        : IRequestHandler<GetEventFeedsCommand, Result<GetEventFeedsResponse>>
    {
        private static readonly AppEvent[] ExcludedEventTypes =
        [
            AppEvent.Mention,
            AppEvent.CardTitleChanged,
        ];

        public async Task<Result<GetEventFeedsResponse>> Handle(
            GetEventFeedsCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? requester = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (requester is null)
            {
                return Result.Fail("Member does not belong to this team.");
            }

            IQueryable<Event> query = dbContext
                .Events.Where(e => e.TeamId == request.TeamId)
                .Where(e => !ExcludedEventTypes.Contains(e.AppEventType));

            DateTime startOfDay = DateTime
                .SpecifyKind(request.Date ?? DateTime.UtcNow, DateTimeKind.Utc)
                .Date;
            DateTime endOfDay = DateTime.SpecifyKind(startOfDay.AddDays(1), DateTimeKind.Utc);
            query = query.Where(e => e.CreatedAt >= startOfDay && e.CreatedAt < endOfDay);

            if (request.MemberIds is { Length: > 0 })
            {
                query = query.Where(e => request.MemberIds.Contains(e.CreatorMemberId));
            }

            var boardAccessQuery = dbContext
                .BoardAccesses.Where(ba =>
                    ba.TeamId == request.TeamId && ba.MemberId == requester.Id
                )
                .Select(ba => ba.BoardId);
            if (request.BoardIds is { Length: > 0 })
            {
                boardAccessQuery = boardAccessQuery.Where(boardId =>
                    request.BoardIds.Contains(boardId)
                );
            }
            query = query.Where(e => boardAccessQuery.Contains(e.Card.BoardId));

            List<Event> events = await query
                .Include(e => e.Card)
                    .ThenInclude(c => c.Board)
                .Include(e => e.Card)
                    .ThenInclude(c => c.Column)
                .Include(e => e.CreatorMember)
                .ToListAsync(cancellationToken);

            // Create a name map for Assign events so we don't have n+1 problem when mapping to dto
            List<Guid> assigneeIds = events
                .Where(e => e.AppEventType is AppEvent.CardAssign or AppEvent.CardUnassign)
                .Select(e =>
                    e.AppEventType is AppEvent.CardAssign
                        ? e.GetMetadata<CardAssignMetadata>()?.AssignedMemberId
                        : e.GetMetadata<CardUnassignMetadata>()?.UnassignedMemberId
                )
                .Where(id => id is not null)
                .Select(id => id!.Value)
                .ToList();

            List<Member> assigneeMembers = await dbContext
                .Members.Where(m => assigneeIds.Contains(m.Id))
                .ToListAsync(cancellationToken);

            IDictionary<Guid, string> nameMap = assigneeMembers.ToDictionary(
                m => m.Id,
                m => m.Name
            );

            DateTime? previousDayWithEvents = await dbContext
                .Events.OrderByDescending(e => e.CreatedAt)
                .Where(e => e.TeamId == request.TeamId)
                .Where(e => !ExcludedEventTypes.Contains(e.AppEventType))
                .Where(e => e.CreatedAt < startOfDay)
                .Where(e => boardAccessQuery.Contains(e.Card.BoardId))
                .Where(e =>
                    request.MemberIds.Length == 0 || request.MemberIds.Contains(e.CreatorMemberId)
                )
                .Select(e => (DateTime?)e.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            IEnumerable<FeedEventMapper.FeedEvent> feedEvents = events.Select(e =>
                FeedEventMapper.MapToFeedEvent(e, requester.Id, nameMap)
            );

            return Result.Ok(
                new GetEventFeedsResponse(feedEvents, previousDayWithEvents?.ToString("yyyy-MM-dd"))
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "api/teams/{teamId:guid}/feeds",
                    async (
                        ClaimsPrincipal user,
                        ISender sender,
                        Guid teamId,
                        [FromQuery] string? cursor,
                        [FromQuery] string? boardIds,
                        [FromQuery] string? memberIds
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        DateTime? parsedDate = null;
                        if (cursor is not null)
                        {
                            if (
                                !DateTime.TryParseExact(
                                    cursor,
                                    "yyyy-MM-dd",
                                    null,
                                    System.Globalization.DateTimeStyles.None,
                                    out DateTime d
                                )
                            )
                                return Results.BadRequest("Date must be in YYYY-MM-DD format.");
                            parsedDate = d;
                        }

                        Guid[] parsedBoardIds =
                            boardIds
                                ?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(s =>
                                    Guid.TryParse(s.Trim(), out Guid id) ? id : (Guid?)null
                                )
                                .Where(id => id is not null)
                                .Select(id => id!.Value)
                                .ToArray()
                            ?? [];

                        Guid[] parsedMemberIds =
                            memberIds
                                ?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(s =>
                                    Guid.TryParse(s.Trim(), out Guid id) ? id : (Guid?)null
                                )
                                .Where(id => id is not null)
                                .Select(id => id!.Value)
                                .ToArray()
                            ?? [];

                        GetEventFeedsCommand command = new(
                            teamId,
                            userId.Value,
                            parsedDate,
                            parsedBoardIds,
                            parsedMemberIds
                        );

                        Result<GetEventFeedsResponse> result = await sender.Send(command);
                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
