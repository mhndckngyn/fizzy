using System.Security.Claims;
using Carter;
using Domain.Constants;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeature;

public static class UpdateBoard
{
    internal sealed record UpdateBoardRequest(
        string Name,
        bool AllAccess = false,
        List<Guid>? RetainedMemberIds = null,
        int? AutoClosePeriodDays = null
    );

    internal sealed record UpdateBoardCommand(
        Guid BoardId,
        Guid TeamId,
        Guid UserId,
        string Name,
        bool AllAccess,
        List<Guid>? RetainedMemberIds,
        int? AutoClosePeriodDays
    ) : IRequest<Result<UpdateBoardResponse>>;

    internal sealed record UpdateBoardResponse(Guid BoardId, string Name, bool AllAccess);

    internal class UpdateBoardHandler(AppDbContext dbContext)
        : IRequestHandler<UpdateBoardCommand, Result<UpdateBoardResponse>>
    {
        public async Task<Result<UpdateBoardResponse>> Handle(
            UpdateBoardCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? member = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            var board = await dbContext.Boards.FirstOrDefaultAsync(
                b => b.Id == request.BoardId && b.TeamId == request.TeamId,
                cancellationToken
            );

            if (board is null)
                return Result.Fail("Board not found.");

            if (!board.CanBeUpdatedBy(member))
                return Result.Fail(
                    "Only Owners, Administrators, or the board creator can update board settings."
                );

            if (
                request.AutoClosePeriodDays is not null
                && !AutoClosePolicy.IsValidPeriod(request.AutoClosePeriodDays.Value)
            )
                return Result.Fail(
                    $"Invalid AutoClosePeriodDays. Valid values: {string.Join(", ", AutoClosePolicy.ValidPeriodDays.Order())}."
                );

            bool turningOnAllAccess = request.AllAccess && !board.AllAccess;
            bool turningOffAllAccess = !request.AllAccess && board.AllAccess;

            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                cancellationToken
            );

            try
            {
                board.Name = request.Name;
                board.AllAccess = request.AllAccess;
                board.AutoClosePeriodDays = request.AutoClosePeriodDays;

                if (turningOnAllAccess)
                {
                    var existingMemberIds = await dbContext
                        .BoardAccesses.Where(ba => ba.BoardId == request.BoardId)
                        .Select(ba => ba.MemberId)
                        .ToListAsync(cancellationToken);

                    var newAccesses = await dbContext
                        .Members.Where(m =>
                            m.TeamId == request.TeamId
                            && m.RemovedAt == null
                            && !existingMemberIds.Contains(m.Id)
                        )
                        .Select(m => m.Id)
                        .ToListAsync(cancellationToken);

                    foreach (Guid memberId in newAccesses)
                        dbContext.BoardAccesses.Add(
                            new BoardAccess(request.TeamId, request.BoardId, memberId)
                        );
                }
                else if (turningOffAllAccess)
                {
                    HashSet<Guid> retainedMemberIds = (request.RetainedMemberIds ?? [])
                        .Append(member.Id) // automatically add the current member so they don't lock themselves out
                        .ToHashSet();

                    var removedMemberIds = await dbContext
                        .BoardAccesses.Where(ba =>
                            ba.BoardId == request.BoardId
                            && !retainedMemberIds.Contains(ba.MemberId)
                        )
                        .Select(ba => ba.MemberId)
                        .ToListAsync(cancellationToken);

                    if (removedMemberIds.Count > 0)
                    {
                        var cardIdsOnBoard = await dbContext
                            .Cards.Where(c => c.BoardId == request.BoardId)
                            .Select(c => c.Id)
                            .ToListAsync(cancellationToken);

                        await dbContext
                            .Notifications.Where(n =>
                                cardIdsOnBoard.Contains(n.CardId)
                                && removedMemberIds.Contains(n.RecipientMemberId)
                                && n.ReadAt == null
                            )
                            .ExecuteDeleteAsync(cancellationToken);

                        await dbContext
                            .CardWatches.Where(cw =>
                                cardIdsOnBoard.Contains(cw.CardId)
                                && removedMemberIds.Contains(cw.MemberId)
                            )
                            .ExecuteDeleteAsync(cancellationToken);

                        await dbContext
                            .BoardAccesses.Where(ba =>
                                ba.BoardId == request.BoardId
                                && removedMemberIds.Contains(ba.MemberId)
                            )
                            .ExecuteDeleteAsync(cancellationToken);
                    }
                }

                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }

            return Result.Ok(new UpdateBoardResponse(board.Id, board.Name, board.AllAccess));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}",
                    async (
                        Guid teamId,
                        Guid boardId,
                        ClaimsPrincipal user,
                        UpdateBoardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        UpdateBoardCommand command = new(
                            boardId,
                            teamId,
                            userId.Value,
                            request.Name,
                            request.AllAccess,
                            request.RetainedMemberIds,
                            request.AutoClosePeriodDays
                        );

                        Result<UpdateBoardResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<UpdateBoardResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
