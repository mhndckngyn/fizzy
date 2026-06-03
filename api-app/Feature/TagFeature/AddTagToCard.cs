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

public static class AddTagToCard
{
    internal sealed record Request(Guid TagId);

    internal sealed record Response(Guid CardTagId, Guid TagId, string Title, string Color);

    internal sealed record Command(Guid TeamId, Guid BoardId, Guid CardId, Guid TagId, Guid UserId)
        : IRequest<Result<Response>>;

    internal sealed class Handler(AppDbContext db) : IRequestHandler<Command, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Command req, CancellationToken ct)
        {
            var member = await db
                .Members.Where(m => m.UserId == req.UserId && m.TeamId == req.TeamId)
                .Select(m => new { m.Id })
                .FirstOrDefaultAsync(ct);

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            Tag? tag = await db.Tags.FirstOrDefaultAsync(
                t => t.Id == req.TagId && t.TeamId == req.TeamId,
                ct
            );

            if (tag is null)
                return Result.Fail("Tag not found.");

            bool alreadyTagged = await db.CardTags.AnyAsync(
                ct2 => ct2.CardId == req.CardId && ct2.TagId == req.TagId,
                ct
            );

            if (alreadyTagged)
                return Result.Fail("This tag is already on the card.");

            CardTag cardTag = new()
            {
                CardId = req.CardId,
                TagId = req.TagId,
                AddedByMemberId = member.Id,
            };

            db.CardTags.Add(cardTag);
            await db.SaveChangesAsync(ct);

            return Result.Ok(new Response(cardTag.Id, tag.Id, tag.Title, tag.Color));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards/{cardId:guid}/tags",
                    async (
                        Guid teamId,
                        Guid boardId,
                        Guid cardId,
                        ClaimsPrincipal user,
                        Request request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Command command = new(teamId, boardId, cardId, request.TagId, userId.Value);
                        Result<Response> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<Response>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
