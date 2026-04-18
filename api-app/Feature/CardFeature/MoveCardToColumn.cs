using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class MoveCardToColumn
{
    internal sealed record MoveCardToColumnCommand(
        Guid TeamId,
        Guid BoardId,
        Guid ColumnId,
        Guid CardId
    ) : IRequest<Result>;

    internal class MoveCardToColumnHandler(AppDbContext dbContext)
        : IRequestHandler<MoveCardToColumnCommand, Result>
    {
        public async Task<Result> Handle(
            MoveCardToColumnCommand request,
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
                {
                    return Result.Fail(
                        new Error(
                            $"Board id {request.BoardId} not found or mismatch with team {request.TeamId}"
                        ).WithMetadata("HttpCode", 404)
                    );
                }

                // Load Column
                var column = await dbContext.Columns.FirstOrDefaultAsync(
                    c => c.Id == request.ColumnId && c.BoardId == request.BoardId,
                    cancellationToken
                );

                if (column is null)
                {
                    return Result.Fail(
                        new Error(
                            $"Column id {request.ColumnId} not found on board {request.BoardId}"
                        ).WithMetadata("HttpCode", 404)
                    );
                }

                // Load Card
                var card = await dbContext.Cards.FirstOrDefaultAsync(
                    c => c.Id == request.CardId && c.BoardId == request.BoardId,
                    cancellationToken
                );

                if (card is null)
                {
                    return Result.Fail(
                        new Error(
                            $"Card id {request.CardId} not found on board {request.BoardId}"
                        ).WithMetadata("HttpCode", 404)
                    );
                }

                // Add Card vào column
                var domainResult = column.AddCard(card);
                if (domainResult.IsFailed)
                {
                    return Result.Fail(
                        new Error(domainResult.Errors.First().Message).WithMetadata("HttpCode", 400)
                    );
                }

                await dbContext
                    .CardNotNows.Where(c => c.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);
                await dbContext
                    .CardMaybes.Where(c => c.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);
                await dbContext
                    .CardDones.Where(c => c.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);

                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Ok();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Fail(
                    new Error(
                        $"Failed to add card to column due to DB error. {ex.Message}"
                    ).CausedBy(ex)
                );
            }
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns/{columnId:guid}/cards/{cardId:guid}",
                async (Guid teamId, Guid boardId, Guid columnId, Guid cardId, IMediator mediator) =>
                {
                    var command = new MoveCardToColumnCommand(teamId, boardId, columnId, cardId);

                    var result = await mediator.Send(command);

                    return result.ToNoContentMinimalApiResult();
                }
            );
        }
    }
}
