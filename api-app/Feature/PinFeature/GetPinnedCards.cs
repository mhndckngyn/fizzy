using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.PinFeatures;

public static class GetPinnedCards
{
    internal sealed record GetPinnedCardsQuery(Guid TeamId, Guid UserId)
        : IRequest<Result<List<PinnedCardDto>>>;

    internal sealed record PinnedCardDto(
        Guid CardId,
        int No,
        string? Title,
        Guid BoardId,
        string BoardName,
        string? ColumnName,
        string? ColumnColor,
        string PinnedAt
    );

    internal class GetPinnedCardsHandler(AppDbContext dbContext)
        : IRequestHandler<GetPinnedCardsQuery, Result<List<PinnedCardDto>>>
    {
        public async Task<Result<List<PinnedCardDto>>> Handle(
            GetPinnedCardsQuery request,
            CancellationToken ct
        )
        {
            var member = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Id })
                .FirstOrDefaultAsync(ct);

            if (member is null)
                return Result.Fail("Not a member of this team.");

            var pins = await dbContext
                .Pins.Where(p => p.MemberId == member.Id && p.TeamId == request.TeamId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PinnedCardDto(
                    p.CardId,
                    p.Card.No,
                    p.Card.Title,
                    p.Card.BoardId,
                    p.Card.Board.Name,
                    p.Card.ColumnId != null
                        ? dbContext
                            .Columns.Where(c => c.Id == p.Card.ColumnId)
                            .Select(c => c.Name)
                            .FirstOrDefault()
                        : null,
                    p.Card.ColumnId != null
                        ? dbContext
                            .Columns.Where(c => c.Id == p.Card.ColumnId)
                            .Select(c => c.Color)
                            .FirstOrDefault()
                        : null,
                    p.CreatedAt.ToString("o")
                ))
                .ToListAsync(ct);

            return Result.Ok(pins);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/pins",
                    async (Guid teamId, ClaimsPrincipal user, ISender sender) =>
                    {
                        var userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new GetPinnedCardsQuery(teamId, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<List<PinnedCardDto>>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
