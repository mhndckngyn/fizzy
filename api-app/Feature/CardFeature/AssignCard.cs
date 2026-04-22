using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using Feature.NotificationFeature;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class AssignCard
{
    // ──────────────────────────────────────────────
    // Assign
    // ──────────────────────────────────────────────

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
            bool cardExists = await dbContext.Cards.AnyAsync(
                c => c.Id == request.CardId && c.BoardId == request.BoardId,
                cancellationToken
            );

            if (!cardExists)
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

            dbContext.CardAssignments.Add(assignment);
            await dbContext.SaveChangesAsync(cancellationToken);

            await sender.Send(
                new SendNotification.SendNotificationCommand(
                    [request.AssigneeMemberId],
                    request.CardId,
                    requester.Id,
                    NotificationType.Assignment
                ),
                cancellationToken
            );

            return Result.Ok(
                new AssignCardResponse(assignment.Id, assignment.CardId, assignee.Id, assignee.Name)
            );
        }
    }

    // ──────────────────────────────────────────────
    // Unassign
    // ──────────────────────────────────────────────

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
            // Requester phải là member của board
            bool isRequesterMember = await dbContext.Members.AnyAsync(
                m =>
                    m.UserId == request.RequesterUserId
                    && dbContext.Boards.Any(b => b.Id == request.BoardId && b.TeamId == m.TeamId),
                cancellationToken
            );

            if (!isRequesterMember)
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

            dbContext.CardAssignments.Remove(assignment);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    // ──────────────────────────────────────────────
    // Endpoints
    // ──────────────────────────────────────────────

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // POST: assign a member to a card
            app.MapPost(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}/assignments",
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
