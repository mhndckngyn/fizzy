using Carter;
using Domain.Entities;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class MoveCardToDone
{
    internal sealed record MoveCardToDoneCommand(Guid TeamId, Guid BoardId, Guid CardId)
        : IRequest<Result>;

    internal class MoveCardToDoneHandler(AppDbContext dbContext)
        : IRequestHandler<MoveCardToDoneCommand, Result>
    {
        public async Task<Result> Handle(
            MoveCardToDoneCommand request,
            CancellationToken cancellationToken
        )
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.ReadCommitted,
                cancellationToken
            );
            try
            {
                // Load Board
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

                // Load Card
                var card = await dbContext.Cards.FirstOrDefaultAsync(
                    c => c.Id == request.CardId && c.BoardId == request.BoardId,
                    cancellationToken
                );

                if (card is null)
                    return Result.Fail(
                        new Error(
                            $"Card id {request.CardId} not found on board {request.BoardId}"
                        ).WithMetadata("HttpCode", 404)
                    );

                // Move card sang Done
                var domainResult = card.MoveToDone();
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

                dbContext.CardDones.Add(new CardDone { CardId = card.Id, BoardId = card.BoardId });

                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Ok();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Fail(
                    new Error(
                        $"Failed to move card to Done state due to DB error. {ex.Message}"
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
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards/{cardId:guid}/done",
                async (Guid teamId, Guid boardId, Guid cardId, IMediator mediator) =>
                {
                    var command = new MoveCardToDoneCommand(teamId, boardId, cardId);
                    var result = await mediator.Send(command);
                    return result.ToNoContentMinimalApiResult();
                }
            );
        }
    }
}
