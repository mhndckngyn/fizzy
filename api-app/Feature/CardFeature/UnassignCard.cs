using System.Security.Claims;
using System.Text.Json;
using Carter;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeature;

public static class UnassignCard
{
    internal sealed record UnassignCardCommand(
        Guid CardId,
        Guid BoardId,
        Guid AssigneeMemberId,
        Guid RequesterUserId
    ) : IRequest<Result>;

    internal class UnassignCardHandler(AppDbContext dbContext)
        : IRequestHandler<UnassignCardCommand, Result>
    {
        public async Task<Result> Handle(
            UnassignCardCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? requester = await dbContext.Members.FirstOrDefaultAsync(
                m =>
                    m.UserId == request.RequesterUserId
                    && dbContext.Boards.Any(b => b.Id == request.BoardId && b.TeamId == m.TeamId),
                cancellationToken
            );

            if (requester is null)
                return Result.Fail("You are not a member of this board.");

            CardAssignment? assignment = await dbContext.CardAssignments.FirstOrDefaultAsync(
                a =>
                    a.CardId == request.CardId
                    && a.BoardId == request.BoardId
                    && a.AssigneeMemberId == request.AssigneeMemberId,
                cancellationToken
            );

            if (assignment is null)
                return Result.Fail("Assignment not found.");

            Member? assignee = await dbContext.Members.FirstOrDefaultAsync(
                m => m.Id == request.AssigneeMemberId,
                cancellationToken
            );

            dbContext.CardAssignments.Remove(assignment);

            dbContext.Events.Add(
                new Event(
                    appEventType: AppEvent.CardUnassign,
                    teamId: requester.TeamId,
                    creatorMemberId: requester.Id,
                    cardId: request.CardId,
                    metadata: JsonSerializer.Serialize(
                        new CardUnassignMetadata { UnassignedMemberName = assignee?.Name ?? "" }
                    )
                )
            );

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // DELETE: unassign a member from a card
            app.MapDelete(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}/assignments/{memberId:guid}",
                    async (
                        Guid boardId,
                        Guid cardId,
                        Guid memberId,
                        ClaimsPrincipal user,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        UnassignCardCommand command = new(cardId, boardId, memberId, userId.Value);

                        Result result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
