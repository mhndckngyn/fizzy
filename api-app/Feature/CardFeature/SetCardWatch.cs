using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeature;

public static class SetCardWatch
{
    internal sealed record SetCardWatchCommand(Guid TeamId, Guid CardId, Guid UserId, bool Watch)
        : IRequest<Result>;

    internal class SetCardWatchHandler(AppDbContext dbContext)
        : IRequestHandler<SetCardWatchCommand, Result>
    {
        public async Task<Result> Handle(
            SetCardWatchCommand request,
            CancellationToken cancellationToken
        )
        {
            Guid? memberId = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => (Guid?)m.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (memberId is null)
                return Result.Fail("You are not a member of this team.");

            Guid? boardId = await dbContext
                .Cards.Where(c => c.Id == request.CardId && c.TeamId == request.TeamId)
                .Select(c => (Guid?)c.BoardId)
                .FirstOrDefaultAsync(cancellationToken);

            if (boardId is null)
                return Result.Fail("Card not found.");

            bool hasAccess = await dbContext.BoardAccesses.AnyAsync(
                ba => ba.BoardId == boardId && ba.MemberId == memberId,
                cancellationToken
            );

            if (!hasAccess)
                return Result.Fail("You do not have access to this board.");

            CardWatch? watch = await dbContext.CardWatches.FirstOrDefaultAsync(
                cw => cw.CardId == request.CardId && cw.MemberId == memberId,
                cancellationToken
            );

            if (watch is null)
            {
                dbContext.CardWatches.Add(
                    new CardWatch(request.TeamId, request.CardId, memberId.Value)
                    {
                        Watching = request.Watch,
                    }
                );
            }
            else
            {
                watch.Watching = request.Watch;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/watch",
                    async (Guid teamId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new SetCardWatchCommand(teamId, cardId, userId.Value, Watch: true)
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
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/unwatch",
                    async (Guid teamId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new SetCardWatchCommand(teamId, cardId, userId.Value, Watch: false)
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
