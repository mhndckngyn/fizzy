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

public static class MoveCardToMaybe
{
    internal sealed record MoveCardToMaybeCommand(
        Guid TeamId,
        Guid BoardId,
        Guid CardId,
        Guid RequesterUserId
    ) : IRequest<Result>;

    internal class MoveCardToMaybeHandler(AppDbContext dbContext)
        : IRequestHandler<MoveCardToMaybeCommand, Result>
    {
        public async Task<Result> Handle(
            MoveCardToMaybeCommand request,
            CancellationToken cancellationToken
        )
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.ReadCommitted,
                cancellationToken
            );
            try
            {
                Member? requester = await dbContext.Members.FirstOrDefaultAsync(
                    m => m.UserId == request.RequesterUserId && m.TeamId == request.TeamId, // TODO add board access check (+ for similar requests)
                    cancellationToken
                );

                if (requester is null)
                    return Result.Fail("You are not a member of this Team.");

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

                // Move card sang Maybe
                var domainResult = card.MoveToMaybe();
                if (domainResult.IsFailed)
                {
                    return Result.Fail(
                        new Error(domainResult.Errors.First().Message).WithMetadata("HttpCode", 400)
                    );
                }

                Event moveToMaybeEvent = new(
                    appEventType: AppEvent.CardToMaybe,
                    teamId: request.TeamId,
                    creatorMemberId: requester.Id,
                    cardId: card.Id
                );

                dbContext.Events.Add(moveToMaybeEvent);

                await dbContext
                    .CardNotNows.Where(c => c.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);
                await dbContext
                    .CardMaybes.Where(c => c.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);
                await dbContext
                    .CardDones.Where(c => c.CardId == request.CardId)
                    .ExecuteDeleteAsync(cancellationToken);

                dbContext.CardMaybes.Add(
                    new CardMaybe { CardId = card.Id, BoardId = card.BoardId }
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
                        $"Failed to move card to Maybe state due to DB error. {ex.Message}"
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
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards/{cardId:guid}/maybe",
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
                        return Results.Unauthorized(); // TODO are we supposed to use FluentResult here

                    var command = new MoveCardToMaybeCommand(teamId, boardId, cardId, userId.Value);
                    var result = await mediator.Send(command);
                    return result.ToNoContentMinimalApiResult();
                }
            );
        }
    }
}
