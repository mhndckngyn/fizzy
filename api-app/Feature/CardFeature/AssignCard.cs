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

public static class AssignCard
{
    internal sealed record AssignCardRequest(Guid MemberId);

    internal sealed record AssignCardCommand(
        Guid CardId,
        Guid BoardId,
        Guid AssigneeMemberId,
        Guid RequesterUserId
    ) : IRequest<Result<AssignCardResponse>>;

    internal sealed record AssignCardResponse(
        Guid AssignmentId,
        Guid CardId,
        Guid AssigneeMemberId,
        string AssigneeName
    );

    internal class AssignCardHandler(AppDbContext dbContext, ISender sender)
        : IRequestHandler<AssignCardCommand, Result<AssignCardResponse>>
    {
        public async Task<Result<AssignCardResponse>> Handle(
            AssignCardCommand request,
            CancellationToken cancellationToken
        )
        {
            // Requester phải là member của board
            Member? requester = await dbContext.Members.FirstOrDefaultAsync(
                m =>
                    m.UserId == request.RequesterUserId
                    && dbContext.Boards.Any(b => b.Id == request.BoardId && b.TeamId == m.TeamId),
                cancellationToken
            );

            if (requester is null)
                return Result.Fail("You are not a member of this board.");

            // Card phải thuộc board
            var card = await dbContext.Cards.FirstOrDefaultAsync(
                c => c.Id == request.CardId && c.BoardId == request.BoardId,
                cancellationToken
            );

            if (card is null)
                return Result.Fail("Card not found in this board.");

            // Assignee phải là member của cùng team
            Member? assignee = await dbContext.Members.FirstOrDefaultAsync(
                m =>
                    m.Id == request.AssigneeMemberId
                    && dbContext.Boards.Any(b => b.Id == request.BoardId && b.TeamId == m.TeamId),
                cancellationToken
            );

            if (assignee is null)
                return Result.Fail("The member to assign does not belong to this board.");

            // Kiểm tra đã assign chưa
            bool alreadyAssigned = await dbContext.CardAssignments.AnyAsync(
                a => a.CardId == request.CardId && a.AssigneeMemberId == request.AssigneeMemberId,
                cancellationToken
            );

            if (alreadyAssigned)
                return Result.Fail("This member is already assigned to the card.");

            CardAssignment assignment = new()
            {
                CardId = request.CardId,
                BoardId = request.BoardId,
                AssigneeMemberId = request.AssigneeMemberId,
                AssignerMemberId = requester.Id,
            };

            CardAssignMetadata metadataObj = new() { AssignedMemberId = assignee.Id };
            Event assignEvent = new(
                appEventType: AppEvent.CardAssign,
                teamId: requester.TeamId,
                creatorMemberId: requester.Id,
                cardId: request.CardId,
                metadata: JsonSerializer.Serialize(metadataObj)
            );

            dbContext.CardAssignments.Add(assignment);
            dbContext.Events.Add(assignEvent);

            bool assigneeAlreadyHasWatchRecord = await dbContext.CardWatches.AnyAsync(
                cw => cw.CardId == request.CardId && cw.MemberId == request.AssigneeMemberId,
                cancellationToken
            );

            if (!assigneeAlreadyHasWatchRecord)
                dbContext.CardWatches.Add(
                    new CardWatch(requester.TeamId, request.CardId, request.AssigneeMemberId)
                );

            card.Touch();

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(
                new AssignCardResponse(assignment.Id, assignment.CardId, assignee.Id, assignee.Name)
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // POST: assign a member to a card
            app.MapPost(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}/assignments", // TODO include teamId & check team
                    async (
                        Guid boardId,
                        Guid cardId,
                        ClaimsPrincipal user,
                        AssignCardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        AssignCardCommand command = new(
                            cardId,
                            boardId,
                            request.MemberId,
                            userId.Value
                        );

                        Result<AssignCardResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Created(
                                $"/api/boards/{boardId}/cards/{cardId}/assignments",
                                new SuccessResponse<AssignCardResponse>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
