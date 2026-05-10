using System.Security.Claims;
using Carter;
using Domain.Entities;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardAccessFeature;

public static class SetBoardWatch
{
    internal sealed record SetBoardWatchCommand(Guid TeamId, Guid BoardId, Guid UserId, bool Watch)
        : IRequest<Result>;

    internal class SetBoardWatchHandler(AppDbContext dbContext)
        : IRequestHandler<SetBoardWatchCommand, Result>
    {
        public async Task<Result> Handle(
            SetBoardWatchCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? member = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            int updated = await dbContext
                .BoardAccesses.Where(ba =>
                    ba.BoardId == request.BoardId && ba.MemberId == member.Id
                )
                .ExecuteUpdateAsync(
                    s =>
                        s.SetProperty(
                            ba => ba.BoardInvolvement,
                            request.Watch ? BoardInvolvement.Watching : BoardInvolvement.AccessOnly
                        ),
                    cancellationToken
                );

            if (updated == 0)
                return Result.Fail("Board not found or you do not have access to it.");

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/watch",
                    async (Guid teamId, Guid boardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Result result = await sender.Send(
                            new SetBoardWatchCommand(teamId, boardId, userId.Value, Watch: true)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<object>(new { }));
                    }
                )
                .RequireAuthorization();

            app.MapPut(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/unwatch",
                    async (Guid teamId, Guid boardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Result result = await sender.Send(
                            new SetBoardWatchCommand(teamId, boardId, userId.Value, Watch: false)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<object>(new { }));
                    }
                )
                .RequireAuthorization();
        }
    }
}
