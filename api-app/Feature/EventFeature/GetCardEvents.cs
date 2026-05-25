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
using Microsoft.EntityFrameworkCore;

namespace Feature.EventFeature;

public static class GetCardEvents
{
    internal sealed record CardEvent(Guid EventId, string Title, string CreatedAt);

    internal sealed record GetCardEventsResponse(IEnumerable<CardEvent> Events);

    internal sealed record GetCardEventsCommand(Guid TeamId, Guid UserId, Guid CardId)
        : IRequest<Result<GetCardEventsResponse>>;

    internal class GetCardEventsHandler(AppDbContext dbContext)
        : IRequestHandler<GetCardEventsCommand, Result<GetCardEventsResponse>>
    {
        private static readonly AppEvent[] IncludedEventTypes =
        [
            AppEvent.CardAssign,
            AppEvent.CardUnassign,
            AppEvent.CardDone,
            AppEvent.CardReopened,
            AppEvent.CardPostponed,
            AppEvent.CardTitleChanged,
            AppEvent.CardBoardChange,
            AppEvent.CardColumnChange,
            AppEvent.CardToMaybe,
        ];

        public async Task<Result<GetCardEventsResponse>> Handle(
            GetCardEventsCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? requester = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (requester is null)
                return Result.Fail("Member does not belong to this team.");

            Domain.Entities.Card? card = await dbContext
                .Cards.Where(c => c.Id == request.CardId && c.TeamId == request.TeamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (card is null)
                return Result.Fail("Card not found.");

            bool hasAccess = await dbContext.BoardAccesses.AnyAsync(
                ba => ba.BoardId == card.BoardId && ba.MemberId == requester.Id,
                cancellationToken
            );

            if (!hasAccess)
                return Result.Fail("Member does not have access to this board.");

            List<Event> events = await dbContext
                .Events.Where(e => e.CardId == request.CardId)
                .Where(e => IncludedEventTypes.Contains(e.AppEventType))
                .Include(e => e.CreatorMember)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

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

            Dictionary<Guid, string> nameMap = await dbContext
                .Members.Where(m => assigneeIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, m => m.Name, cancellationToken);

            IEnumerable<CardEvent> cardEvents = events.Select(e => new CardEvent(
                e.Id,
                GetTitle(e, nameMap),
                e.CreatedAt.ToString("o")
            ));

            return Result.Ok(new GetCardEventsResponse(cardEvents));
        }

        private static string GetTitle(Event e, IDictionary<Guid, string> nameMap)
        {
            string creator = e.CreatorMember?.Name ?? "System";
            return e.AppEventType switch
            {
                AppEvent.CardAssign => AssignTitle(e, creator, nameMap),
                AppEvent.CardUnassign => UnassignTitle(e, creator, nameMap),
                AppEvent.CardDone => $"Moved to \"Done\" by {creator}",
                AppEvent.CardReopened => $"Reopened by {creator}",
                AppEvent.CardPostponed => $"{creator} moved this to \"Not Now\"",
                AppEvent.CardAutoPostponed => "Moved to Not Now due to inactivity",
                AppEvent.CardTitleChanged => TitleChangedTitle(e, creator),
                AppEvent.CardBoardChange => BoardChangedTitle(e, creator),
                AppEvent.CardColumnChange => ColumnChangedTitle(e, creator),
                AppEvent.CardToMaybe => $"{creator} moved this back to \"Maybe?\"",
                _ => "",
            };
        }

        private static string AssignTitle(
            Event e,
            string creator,
            IDictionary<Guid, string> nameMap
        )
        {
            Guid? id = e.GetMetadata<CardAssignMetadata>()?.AssignedMemberId;
            string assignee =
                id.HasValue && nameMap.TryGetValue(id.Value, out var name) ? name : "someone";
            return $"{creator} assigned this to {assignee}";
        }

        private static string UnassignTitle(
            Event e,
            string creator,
            IDictionary<Guid, string> nameMap
        )
        {
            Guid? id = e.GetMetadata<CardUnassignMetadata>()?.UnassignedMemberId;
            string assignee =
                id.HasValue && nameMap.TryGetValue(id.Value, out var name) ? name : "someone";
            return $"{creator} unassigned {assignee} from this";
        }

        private static string TitleChangedTitle(Event e, string creator)
        {
            var meta = e.GetMetadata<CardTitleChangeMetadata>();
            return $"{creator} changed the title from \"{meta?.OldTitle}\" to \"{meta?.NewTitle}\"";
        }

        private static string BoardChangedTitle(Event e, string creator)
        {
            var meta = e.GetMetadata<CardMoveBoardMetadata>();
            return $"{creator} moved this from \"{meta?.OriginalBoardName}\" to \"{meta?.DestinationBoardName}\"";
        }

        private static string ColumnChangedTitle(Event e, string creator)
        {
            string column =
                e.GetMetadata<CardMoveToColumnMetadata>()?.ColumnName ?? "another column";
            return $"{creator} moved this to \"{column}\"";
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/events",
                    async (ClaimsPrincipal user, ISender sender, Guid teamId, Guid cardId) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Result<GetCardEventsResponse> result = await sender.Send(
                            new GetCardEventsCommand(teamId, userId.Value, cardId)
                        );

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
