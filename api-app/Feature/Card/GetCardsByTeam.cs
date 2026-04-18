using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.Card;

public class GetCardsByTeam
{
    internal sealed record GetCardsByTeamQuery(Guid TeamId)
        : IRequest<Result<GetCardsByTeamResponse>>;

    internal sealed record GetCardsByTeamResponse(IEnumerable<CardDto> Cards);

    internal sealed record CardDto(Guid CardId, int No, string? Title);

    internal class GetCardsByTeamHandler(AppDbContext dbContext)
        : IRequestHandler<GetCardsByTeamQuery, Result<GetCardsByTeamResponse>>
    {
        public async Task<Result<GetCardsByTeamResponse>> Handle(
            GetCardsByTeamQuery query,
            CancellationToken cancellationToken
        )
        {
            List<CardDto> cards = await dbContext
                .Cards.AsNoTracking()
                .Where(c => c.TeamId == query.TeamId)
                .Select(c => new CardDto(c.Id, c.No, c.Title))
                .ToListAsync(cancellationToken);

            GetCardsByTeamResponse response = new(cards);

            return Result.Ok(response);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                "/api/teams/{teamId:guid}/cards",
                async (Guid teamId, IMediator mediator) =>
                {
                    GetCardsByTeamQuery query = new(teamId);

                    Result<GetCardsByTeamResponse> result = await mediator.Send(query);

                    return result.ToMinimalApiResult();
                }
            );
        }
    }
}
