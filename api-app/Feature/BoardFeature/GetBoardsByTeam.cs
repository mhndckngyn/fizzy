using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeatures;

public static class GetBoardsByTeam
{
    internal sealed record GetBoardsQuery(Guid TeamId, Guid UserId)
        : IRequest<Result<GetBoardsResponse>>;

    internal sealed record GetBoardsResponse(List<BoardDto> Boards);

    internal sealed record BoardDto(
        Guid BoardId,
        string Name,
        bool AllAccess,
        string CreatorName,
        List<CardDto> NotNowCards,
        List<CardDto> MaybeCards,
        List<CardDto> DoneCards
    );

    internal sealed record CardDto(
        Guid CardId,
        string? Title,
        string CreatorName,
        DateTime UpdatedAt
    );

    internal class GetBoardsHandler(AppDbContext dbContext)
        : IRequestHandler<GetBoardsQuery, Result<GetBoardsResponse>>
    {
        public async Task<Result<GetBoardsResponse>> Handle(
            GetBoardsQuery request,
            CancellationToken cancellationToken
        )
        {
            bool isMember = await dbContext.Members.AnyAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (!isMember)
                return Result.Fail("You are not a member of this team.");

            List<BoardDto> boards = await dbContext
                .Boards.Where(b => b.TeamId == request.TeamId)
                .Select(b => new BoardDto(
                    b.Id,
                    b.Name,
                    b.AllAccess,
                    b.Creator.Name,
                    // Not now cards
                    dbContext
                        .CardNotNows.Where(n => n.BoardId == b.Id)
                        .Select(n => n.Card)
                        .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                        .Select(c => new CardDto(
                            c.Id,
                            c.Title,
                            c.Creator.Name,
                            c.UpdatedAt ?? c.CreatedAt
                        ))
                        .ToList(),
                    // Maybe cards
                    dbContext
                        .CardMaybes.Where(m => m.BoardId == b.Id)
                        .Select(m => m.Card)
                        .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                        .Select(c => new CardDto(
                            c.Id,
                            c.Title,
                            c.Creator.Name,
                            c.UpdatedAt ?? c.CreatedAt
                        ))
                        .ToList(),
                    // Done cards
                    dbContext
                        .CardDones.Where(d => d.BoardId == b.Id)
                        .Select(d => d.Card)
                        .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                        .Select(c => new CardDto(
                            c.Id,
                            c.Title,
                            c.Creator.Name,
                            c.UpdatedAt ?? c.CreatedAt
                        ))
                        .ToList()
                ))
                .ToListAsync(cancellationToken);

            return Result.Ok(new GetBoardsResponse(boards));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/boards",
                    async (Guid teamId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        GetBoardsQuery query = new(teamId, userId.Value);
                        Result<GetBoardsResponse> result = await sender.Send(query);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<GetBoardsResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
