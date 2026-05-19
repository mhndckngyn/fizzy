using System.Security.Claims;
using Carter;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeature;

public static class GetBoardsByTeam
{
    internal sealed record GetBoardsQuery(Guid TeamId, Guid UserId)
        : IRequest<Result<GetBoardsResponse>>;

    internal sealed record GetBoardsResponse(IEnumerable<BoardDto> Boards);

    internal sealed record BoardDto(Guid BoardId, string Name, bool IsWatching);

    internal class GetBoardsHandler(AppDbContext dbContext)
        : IRequestHandler<GetBoardsQuery, Result<GetBoardsResponse>>
    {
        public async Task<Result<GetBoardsResponse>> Handle(
            GetBoardsQuery request,
            CancellationToken cancellationToken
        )
        {
            Guid? memberId = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => (Guid?)m.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (memberId is null)
                return Result.Fail("You are not a member of this team.");

            List<BoardDto> boards = await dbContext
                .BoardAccesses.Where(ba => ba.TeamId == request.TeamId && ba.MemberId == memberId)
                .OrderBy(ba => ba.Board.Name)
                .Select(ba => new BoardDto(
                    ba.BoardId,
                    ba.Board.Name,
                    ba.BoardInvolvement == BoardInvolvement.Watching
                ))
                .ToListAsync(cancellationToken);

            return Result.Ok<GetBoardsResponse>(new GetBoardsResponse(boards));
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

                        Result<GetBoardsResponse> result = await sender.Send(
                            new GetBoardsQuery(teamId, userId.Value)
                        );

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
