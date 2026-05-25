using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.Card;

public class GetCardsByBoard
{
    internal sealed record GetCardsByBoardQuery(Guid TeamId, Guid BoardId)
        : IRequest<Result<GetCardsByBoardResponse>>;

    internal sealed record GetCardsByBoardResponse(IEnumerable<CardDto> Cards);

    internal sealed record CardDto(
        Guid CardId,
        int No,
        string? Title,
        DateTime CreatedAt,
        DateTime LastActiveAt,
        int AutoClosePeriodDays,
        string? CreatorName,
        Guid? ColumnId,
        Guid? MaybeId,
        Guid? DoneId,
        Guid? NotNowId
    );

    internal class GetCardsByBoardHandler(AppDbContext dbContext)
        : IRequestHandler<GetCardsByBoardQuery, Result<GetCardsByBoardResponse>>
    {
        public async Task<Result<GetCardsByBoardResponse>> Handle(
            GetCardsByBoardQuery request,
            CancellationToken cancellationToken
        )
        {
            List<CardDto> cards = await dbContext
                .Cards.AsNoTracking()
                .Where(c => c.BoardId == request.BoardId)
                .Select(c => new CardDto(
                    c.Id,
                    c.No,
                    c.Title,
                    c.CreatedAt,
                    c.LastActiveAt,
                    c.Board.AutoClosePeriodDays ?? c.Board.Team.AutoClosePeriodDays,
                    c.Creator.Name,
                    c.ColumnId,
                    c.Maybe != null ? c.Maybe.Id : null,
                    c.Done != null ? c.Done.Id : null,
                    c.NotNow != null ? c.NotNow.Id : null
                ))
                .ToListAsync(cancellationToken);

            GetCardsByBoardResponse response = new(cards);

            return Result.Ok(response);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards",
                async (Guid teamId, Guid boardId, IMediator mediator) =>
                {
                    GetCardsByBoardQuery query = new(teamId, boardId);

                    Result<GetCardsByBoardResponse> result = await mediator.Send(query);

                    return result.ToMinimalApiResult();
                }
            );
        }
    }
}
