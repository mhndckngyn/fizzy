using System.Security.Claims;
using Carter;
using Domain.Entities;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class MoveCardToBoard
{
    internal sealed record MoveCardToBoardRequest(Guid TargetBoardId);

    internal sealed record MoveCardToBoardCommand(
        Guid CardId,
        Guid CurrentBoardId,
        Guid TargetBoardId,
        Guid UserId
    ) : IRequest<Result>;

    internal class MoveCardToBoardHandler(AppDbContext dbContext)
        : IRequestHandler<MoveCardToBoardCommand, Result>
    {
        public async Task<Result> Handle(
            MoveCardToBoardCommand request,
            CancellationToken cancellationToken
        )
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync(
                cancellationToken
            );
            try
            {
                var cardInfo = await dbContext
                    .Cards.Where(c => c.Id == request.CardId && c.BoardId == request.CurrentBoardId)
                    .Select(c => new { c.Id, c.TeamId })
                    .FirstOrDefaultAsync(cancellationToken);

                if (cardInfo is null)
                    return Result.Fail("Card not found in this board.");

                // TODO when we take teamId, we should also move this check up
                Member? member = await dbContext.Members.FirstOrDefaultAsync(
                    m => m.UserId == request.UserId && m.TeamId == cardInfo.TeamId,
                    cancellationToken
                );

                if (member is null)
                    return Result.Fail("You are not a member of this team.");

                bool targetBoardExists = await dbContext.Boards.AnyAsync(
                    b => b.Id == request.TargetBoardId && b.TeamId == cardInfo.TeamId,
                    cancellationToken
                );

                if (!targetBoardExists)
                    return Result.Fail("Target board not found in this team.");

                // Cập nhật BoardId + xóa ColumnId (card.ColumnId là FK trực tiếp)
                // Dùng ExecuteUpdate để atomic
                int updated = await dbContext
                    .Cards.Where(c => c.Id == request.CardId)
                    .ExecuteUpdateAsync(
                        s =>
                            s.SetProperty(c => c.BoardId, request.TargetBoardId)
                                .SetProperty(c => c.ColumnId, (Guid?)null),
                        cancellationToken
                    );

                if (updated == 0)
                    return Result.Fail("Failed to move card.");

                // Xóa trạng thái cũ — CardMaybe/Done/NotNow đều unique trên CardId
                await dbContext
                    .CardMaybes.Where(cm => cm.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);

                await dbContext
                    .CardDones.Where(cd => cd.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);

                await dbContext
                    .CardNotNows.Where(cn => cn.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);

                // Cập nhật BoardId trên CardAssignments
                // (FK CardAssignment.BoardId -> Board, OnDelete NoAction)
                // TODO either grant board access or remove assignment for users who do not have access to new board
                await dbContext
                    .CardAssignments.Where(a => a.CardId == request.CardId)
                    .ExecuteUpdateAsync(
                        s => s.SetProperty(a => a.BoardId, request.TargetBoardId),
                        cancellationToken
                    );

                // Tạo CardMaybe cho board mới — landing zone mặc định
                dbContext.CardMaybes.Add(
                    new CardMaybe { CardId = request.CardId, BoardId = request.TargetBoardId }
                );

                Event cardBoardChangeEvent = new(
                    appEventType: AppEvent.CardBoardChange,
                    teamId: cardInfo.TeamId,
                    creatorMemberId: member.Id,
                    cardId: cardInfo.Id
                );

                dbContext.Events.Add(cardBoardChangeEvent);

                await dbContext.SaveChangesAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);
                return Result.Ok();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Fail(
                    new Error($"Failed to move Card to target Board. {ex.Message}").CausedBy(ex)
                );
            }
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}/board", // TODO should include teamId
                    async (
                        Guid boardId,
                        Guid cardId,
                        ClaimsPrincipal user,
                        MoveCardToBoardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new MoveCardToBoardCommand(
                                cardId,
                                boardId,
                                request.TargetBoardId,
                                userId.Value
                            )
                        );

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
