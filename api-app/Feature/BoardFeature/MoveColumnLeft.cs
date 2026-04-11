using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeatures;

public static class MoveColumnLeft
{
    internal sealed record MoveColumnLeftRequest(Guid ColumnId);

    internal sealed record MoveColumnLeftCommand(Guid TeamId, Guid BoardId, Guid ColumnId)
        : IRequest<Result>;

    internal class MoveColumnLeftHandler(AppDbContext dbContext)
        : IRequestHandler<MoveColumnLeftCommand, Result>
    {
        public async Task<Result> Handle(
            MoveColumnLeftCommand request,
            CancellationToken cancellationToken
        )
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.RepeatableRead,
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

                var currentColumn = await dbContext.Columns.FirstOrDefaultAsync(
                    c => c.Id == request.ColumnId && c.BoardId == request.BoardId,
                    cancellationToken
                );

                if (currentColumn is null)
                {
                    return Result.Fail(
                        new Error(
                            $"Column id {request.ColumnId} not found on board {request.BoardId}"
                        ).WithMetadata("HttpCode", 404)
                    );
                }

                var leftColumn = await dbContext
                    .Columns.Where(c =>
                        c.BoardId == request.BoardId && c.Position < currentColumn.Position
                    )
                    .OrderByDescending(c => c.Position)
                    .FirstOrDefaultAsync(cancellationToken);

                if (leftColumn is null)
                {
                    return Result.Fail(
                        new Error("Column is already at the leftmost position").WithMetadata(
                            "HttpCode",
                            400
                        )
                    );
                }

                // Swap positions
                (leftColumn.Position, currentColumn.Position) = (
                    currentColumn.Position,
                    leftColumn.Position
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
                        "Failed to move column due to a concurrency conflict or DB error."
                    ).CausedBy(ex)
                );
            }
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns/{columnId:guid}/left",
                async (Guid teamId, Guid boardId, Guid columnId, IMediator mediator) =>
                {
                    var command = new MoveColumnLeftCommand(teamId, boardId, columnId);

                    var result = await mediator.Send(command);
                    return result.ToNoContentMinimalApiResult();
                }
            );
        }
    }
}
