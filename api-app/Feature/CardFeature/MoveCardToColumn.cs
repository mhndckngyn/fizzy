using System.Security.Claims;
using System.Text.Json;
using Carter;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeature;

public static class MoveCardToColumn
{
    internal sealed record MoveCardToColumnCommand(
        Guid TeamId,
        Guid BoardId,
        Guid ColumnId,
        Guid CardId,
        Guid UserId
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

                AppEvent? eventType = null;
                if (
                    card.ColumnId != null
                    || await dbContext.CardMaybes.AnyAsync(
                        c => c.CardId == request.CardId,
                        cancellationToken
                    )
                )
                    eventType = AppEvent.CardColumnChange;
                else if (
                    await dbContext.CardDones.AnyAsync(
                        c => c.CardId == request.CardId,
                        cancellationToken
                    )
                )
                    eventType = AppEvent.CardReopened;
                else if (
                    await dbContext.CardNotNows.AnyAsync(
                        c => c.CardId == request.CardId,
                        cancellationToken
                    )
                )
                    eventType = AppEvent.CardResumed;

                string columnMetadata = JsonSerializer.Serialize(
                    new CardMoveToColumnMetadata { ColumnName = column.Name }
                );

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

                if (eventType.HasValue)
                {
                    dbContext.Events.Add(
                        new Event(
                            appEventType: eventType.Value,
                            teamId: request.TeamId,
                            creatorMemberId: member.Id,
                            cardId: card.Id,
                            metadata: columnMetadata
                        )
                    );
                }

                card.Touch();

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
                    async (
                        ClaimsPrincipal user,
                        Guid teamId,
                        Guid boardId,
                        Guid columnId,
                        Guid cardId,
                        IMediator mediator
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var command = new MoveCardToColumnCommand(
                            teamId,
                            boardId,
                            columnId,
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
