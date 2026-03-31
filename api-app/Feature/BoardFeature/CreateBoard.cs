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

public static class CreateBoard
{
    internal sealed record CreateBoardRequest(string Name, bool AllAccess = false);

    internal sealed record CreateBoardCommand(string Name, Guid TeamId, Guid UserId, bool AllAccess)
        : IRequest<Result<CreateBoardResponse>>;

    internal sealed record CreateBoardResponse(Guid BoardId, string Name);

    internal class CreateBoardHandler(AppDbContext dbContext)
        : IRequestHandler<CreateBoardCommand, Result<CreateBoardResponse>>
    {
        public async Task<Result<CreateBoardResponse>> Handle(
            CreateBoardCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? member = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            Board board = new()
            {
                Name = request.Name,
                AllAccess = request.AllAccess,
                TeamId = request.TeamId,
                CreatorMemberId = member.Id,
            };

            dbContext.Boards.Add(board);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new CreateBoardResponse(board.Id, board.Name));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/{teamId:guid}/boards",
                    async (
                        ClaimsPrincipal user,
                        Guid teamId,
                        CreateBoardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        CreateBoardCommand command = new(
                            request.Name,
                            teamId,
                            userId.Value,
                            request.AllAccess
                        );

                        Result<CreateBoardResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Created(
                                $"/api/teams/{teamId}/boards/{result.Value.BoardId}",
                                new SuccessResponse<CreateBoardResponse>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
