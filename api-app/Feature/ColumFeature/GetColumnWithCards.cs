using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.ColumnFeatures;

public static class GetColumnWithCards
{
    // DTO cho Card
    internal sealed record CardDto(Guid Id, string? Title, string CreatorName);

    // DTO cho Column (bao gồm mảng CardDto)
    internal sealed record GetColumnWithCardsResponse(
        Guid Id,
        string Name,
        string Color,
        int Position,
        IEnumerable<CardDto> Cards
    );

    internal sealed record GetColumnWithCardsQuery(Guid TeamId, Guid BoardId, Guid ColumnId)
        : IRequest<Result<GetColumnWithCardsResponse>>;

    internal class Handler(AppDbContext dbContext)
        : IRequestHandler<GetColumnWithCardsQuery, Result<GetColumnWithCardsResponse>>
    {
        public async Task<Result<GetColumnWithCardsResponse>> Handle(
            GetColumnWithCardsQuery request,
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

            // Fetch Column và map Card
            var column = await dbContext
                .Columns.Where(c => c.Id == request.ColumnId && c.BoardId == request.BoardId)
                .Select(c => new GetColumnWithCardsResponse(
                    c.Id,
                    c.Name,
                    c.Color,
                    c.Position,
                    c.Cards.Select(card => new CardDto(card.Id, card.Title, card.Creator.Name))
                ))
                .FirstOrDefaultAsync(cancellationToken);

            if (column is null)
            {
                return Result.Fail(
                    new Error(
                        $"Column id {request.ColumnId} not found on board {request.BoardId}"
                    ).WithMetadata("HttpCode", 404)
                );
            }

            return Result.Ok(column);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/columns/{columnId:guid}",
                async (Guid teamId, Guid boardId, Guid columnId, IMediator mediator) =>
                {
                    var query = new GetColumnWithCardsQuery(teamId, boardId, columnId);

                    var result = await mediator.Send(query);

                    return result.ToMinimalApiResult();
                }
            );
        }
    }
}
