using Carter;
using Domain.Entities;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeatures;

public static class CreateColumn
{
    internal sealed record CreateColumnRequest(string Name, int Position, string Color);

    internal sealed record CreateColumnCommand(
        Guid TeamId,
        Guid BoardId,
        string Name,
        int Position,
        string Color
    ) : IRequest<Result<CreateColumnResponse>>;

    internal sealed record CreateColumnResponse(
        Guid TeamId,
        Guid BoardId,
        Guid ColumnId,
        string Name,
        int Position,
        string Color
    );

    internal class CreateColumnHandler(AppDbContext dbContext)
        : IRequestHandler<CreateColumnCommand, Result<CreateColumnResponse>>
    {
        public async Task<Result<CreateColumnResponse>> Handle(
            CreateColumnCommand request,
            CancellationToken cancellationToken
        )
        {
            var board = await dbContext.Boards.FirstOrDefaultAsync(
                b => b.Id == request.BoardId && b.TeamId == request.TeamId,
                cancellationToken
            );
            if (board is null)
                return Result.Fail(
                    new Error($"Board id {request.BoardId} not found").WithMetadata("HttpCode", 404)
                );

            Column column = new()
            {
                Name = request.Name,
                Position = request.Position,
                Color = request.Color,
                BoardId = request.BoardId,
            };

            dbContext.Columns.Add(column);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok(
                new CreateColumnResponse(
                    request.TeamId,
                    column.BoardId,
                    column.Id,
                    column.Name,
                    column.Position,
                    column.Color
                )
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns",
                async (
                    Guid teamId,
                    Guid boardId,
                    CreateColumnRequest request,
                    IMediator mediator
                ) =>
                {
                    var command = new CreateColumnCommand(
                        teamId,
                        boardId,
                        request.Name,
                        request.Position,
                        request.Color
                    );

                    var result = await mediator.Send(command);
                    return result.ToCreatedMinimalApiResult(
                        (response) =>
                            $"/api/teams/{response.TeamId}/boards/{response.BoardId}/columns/{response.ColumnId}"
                    );
                }
            );
        }
    }
}
