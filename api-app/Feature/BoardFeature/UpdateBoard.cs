using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardFeatures;

public static class UpdateBoard
{
    internal sealed record UpdateBoardRequest(string Name, bool AllAccess = false);

    internal sealed record UpdateBoardCommand(
        Guid BoardId,
        Guid TeamId,
        Guid UserId,
        string Name,
        bool AllAccess
    ) : IRequest<Result<UpdateBoardResponse>>;

    internal sealed record UpdateBoardResponse(Guid BoardId, string Name, bool AllAccess);

    internal class UpdateBoardHandler(AppDbContext dbContext)
        : IRequestHandler<UpdateBoardCommand, Result<UpdateBoardResponse>>
    {
        public async Task<Result<UpdateBoardResponse>> Handle(
            UpdateBoardCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? member = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            var board = await dbContext.Boards.FirstOrDefaultAsync(
                b => b.Id == request.BoardId && b.TeamId == request.TeamId,
                cancellationToken
            );

            if (board is null)
                return Result.Fail("Board not found.");

            board.Name = request.Name;
            board.AllAccess = request.AllAccess;

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new UpdateBoardResponse(board.Id, board.Name, board.AllAccess));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}",
                    async (
                        Guid teamId,
                        Guid boardId,
                        ClaimsPrincipal user,
                        UpdateBoardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        UpdateBoardCommand command = new(
                            boardId,
                            teamId,
                            userId.Value,
                            request.Name,
                            request.AllAccess
                        );

                        Result<UpdateBoardResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<UpdateBoardResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
