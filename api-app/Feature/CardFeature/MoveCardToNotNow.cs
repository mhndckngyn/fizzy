using System.Security.Claims;
using Carter;
using Domain.Entities;
using Domain.Enums;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeature;

public static class MoveCardToNotNow
{
    internal sealed record MoveCardToNotNowCommand(
        Guid TeamId,
        Guid BoardId,
        Guid CardId,
        Guid UserId
    ) : IRequest<Result>;

    internal class MoveCardToNotNowHandler(AppDbContext dbContext)
        : IRequestHandler<MoveCardToNotNowCommand, Result>
    {
        public async Task<Result> Handle(
            MoveCardToNotNowCommand request,
            CancellationToken cancellationToken
        )
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.ReadCommitted,
                cancellationToken
            );
            try
            {
                Member? member = await dbContext.Members.FirstOrDefaultAsync(
                    m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                    cancellationToken
                );

                if (member is null)
                    return Result.Fail(
                        new Error("You are not a member of this team.").WithMetadata(
                            "HttpCode",
                            403
                        )
                    );

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

                // Move card sang NotNow
                var domainResult = card.MoveToNotNow();
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

                dbContext.CardNotNows.Add(
                    new CardNotNow { CardId = card.Id, BoardId = card.BoardId }
                );

                dbContext.Events.Add(
                    new Event(
                        appEventType: AppEvent.CardPostponed,
                        teamId: request.TeamId,
                        creatorMemberId: member.Id,
                        cardId: card.Id
                    )
                );

                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Ok();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Fail(
                    new Error(
                        $"Failed to move card to NotNow state due to DB error. {ex.Message}"
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
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards/{cardId:guid}/not-now",
                    async (
                        ClaimsPrincipal user,
                        Guid teamId,
                        Guid boardId,
                        Guid cardId,
                        IMediator mediator
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var command = new MoveCardToNotNowCommand(
                            teamId,
                            boardId,
                            cardId,
                            userId.Value
                        );
                        var result = await mediator.Send(command);
                        return result.ToNoContentMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
