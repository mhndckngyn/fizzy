using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeatures;

public static class EditColumn
{
    internal sealed record EditColumnRequest(string Name, string Color);

    internal sealed record EditColumnCommand(
        Guid TeamId,
        Guid BoardId,
        Guid ColumnId,
        string Name,
        string Color
    ) : IRequest<Result>;

    internal class EditColumnHandler(AppDbContext dbContext)
        : IRequestHandler<EditColumnCommand, Result>
    {
        public async Task<Result> Handle(
            EditColumnCommand request,
            CancellationToken cancellationToken
        )
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

            column.Name = request.Name;
            column.Color = request.Color;

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns/{columnId:guid}",
                async (
                    Guid teamId,
                    Guid boardId,
                    Guid columnId,
                    EditColumnRequest request,
                    IMediator mediator
                ) =>
                {
                    var command = new EditColumnCommand(
                        teamId,
                        boardId,
                        columnId,
                        request.Name,
                        request.Color
                    );

                    var result = await mediator.Send(command);
                    return result.ToNoContentMinimalApiResult();
                }
            );
        }
    }
}
