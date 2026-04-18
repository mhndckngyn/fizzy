using Carter;
using Domain.Entities;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.ColumnFeatures;

public static class DeleteColumn
{
    // WARNING: THIS API STILL NOT COMPLETE
    // TODO: NEED TO REPOSITION ALL COLUMNS IN THE SAME BOARD AFTER DELETE
    internal sealed record DeleteColumnCommand(Guid TeamId, Guid BoardId, Guid ColumnId)
        : IRequest<Result>;

    internal class DeleteColumnHandler(AppDbContext dbContext)
        : IRequestHandler<DeleteColumnCommand, Result>
    {
        public async Task<Result> Handle(
            DeleteColumnCommand request,
            CancellationToken cancellationToken
        )
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.ReadCommitted,
                cancellationToken
            );
            try
            {
                bool isValidBoard = await dbContext.Boards.AnyAsync(
                    b => b.Id == request.BoardId && b.TeamId == request.TeamId,
                    cancellationToken
                );

                if (!isValidBoard)
                    return Result.Fail(
                        new Error(
                            $"Board id {request.BoardId} not found or mismatch with team {request.TeamId}"
                        ).WithMetadata("HttpCode", 404)
                    );

                // Load Column kèm Cards
                var column = await dbContext
                    .Columns.Include(c => c.Cards)
                    .FirstOrDefaultAsync(
                        c => c.Id == request.ColumnId && c.BoardId == request.BoardId,
                        cancellationToken
                    );

                if (column is null)
                    return Result.Fail(
                        new Error(
                            $"Column id {request.ColumnId} not found on board {request.BoardId}"
                        ).WithMetadata("HttpCode", 404)
                    );

                var cardsToMove = column.Cards.ToList();
                var cardIds = cardsToMove.Select(c => c.Id).ToList();

                // Clear các trạng thái hiện tại của cards (nếu có) trước khi move sang Maybe
                if (cardIds.Count > 0)
                {
                    await dbContext
                        .CardNotNows.Where(c => cardIds.Contains(c.CardId))
                        .ExecuteDeleteAsync(cancellationToken);
                    await dbContext
                        .CardMaybes.Where(c => cardIds.Contains(c.CardId))
                        .ExecuteDeleteAsync(cancellationToken);
                    await dbContext
                        .CardDones.Where(c => cardIds.Contains(c.CardId))
                        .ExecuteDeleteAsync(cancellationToken);
                }

                // Update các card sang trạng thái Maybe
                var newMaybes = new List<CardMaybe>();

                foreach (var card in cardsToMove)
                {
                    newMaybes.Add(card.MoveToMaybe().Value);
                }

                if (newMaybes.Count > 0)
                {
                    // Update vào table Maybe
                    dbContext.CardMaybes.AddRange(newMaybes);
                }

                // Xóa Column
                dbContext.Columns.Remove(column);

                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Ok();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Fail(
                    new Error(
                        $"Failed to delete column and move cards to Maybe state. {ex.Message}"
                    ).CausedBy(ex)
                );
            }
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns/{columnId:guid}",
                async (Guid teamId, Guid boardId, Guid columnId, IMediator mediator) =>
                {
                    var command = new DeleteColumnCommand(teamId, boardId, columnId);
                    var result = await mediator.Send(command);
                    return result.ToNoContentMinimalApiResult();
                }
            );
        }
    }
}
