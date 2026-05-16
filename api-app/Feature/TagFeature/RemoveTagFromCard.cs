using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TagFeature;

public static class RemoveTagFromCard
{
    internal sealed record Command(Guid TeamId, Guid BoardId, Guid CardId, Guid TagId, Guid UserId)
        : IRequest<Result>;

    internal sealed class Handler(AppDbContext db) : IRequestHandler<Command, Result>
    {
        public async Task<Result> Handle(Command req, CancellationToken ct)
        {
            bool isMember = await db.Members.AnyAsync(
                m => m.UserId == req.UserId && m.TeamId == req.TeamId,
                ct
            );

            if (!isMember)
                return Result.Fail("You are not a member of this team.");

            CardTag? cardTag = await db.CardTags.FirstOrDefaultAsync(
                ct2 => ct2.CardId == req.CardId && ct2.TagId == req.TagId,
                ct
            );

            if (cardTag is null)
                return Result.Fail("Tag is not on this card.");

            db.CardTags.Remove(cardTag);
            await db.SaveChangesAsync(ct);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards/{cardId:guid}/tags/{tagId:guid}",
                    async (
                        Guid teamId,
                        Guid boardId,
                        Guid cardId,
                        Guid tagId,
                        ClaimsPrincipal user,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Command command = new(teamId, boardId, cardId, tagId, userId.Value);
                        Result result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
