using Carter;
using Domain.Entities;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.ColumFeature;

public static class GetAllColumnsByBoard
{
    internal sealed record ColumnDto(Guid ColumnId, string Name, int Position, string Color);

    internal sealed record GetColumnListResponse(IEnumerable<ColumnDto> Columns);

    internal sealed record GetColumnListQuery(Guid TeamId, Guid BoardId)
        : IRequest<Result<GetColumnListResponse>>;

    internal class Handler(AppDbContext dbContext)
        : IRequestHandler<GetColumnListQuery, Result<GetColumnListResponse>>
    {
        public async Task<Result<GetColumnListResponse>> Handle(
            GetColumnListQuery request,
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

            IEnumerable<ColumnDto> columns = await dbContext
                .Columns.Where(c => c.BoardId == request.BoardId)
                .Select(c => new ColumnDto(c.Id, c.Name, c.Position, c.Color))
                .ToListAsync(cancellationToken);

            return Result.Ok(new GetColumnListResponse(columns));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns",
                async (Guid teamId, Guid boardId, IMediator mediator) =>
                {
                    GetColumnListQuery query = new(teamId, boardId);

                    Result<GetColumnListResponse> result = await mediator.Send(query);

                    return result.ToMinimalApiResult();
                }
            );
        }
    }
}
