using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TagFeature;

public static class ListTags
{
    public sealed record TagDto(
        Guid TagId,
        string Title,
        string Color,
        int CardCount,
        bool IsAssigned
    );

    internal sealed record Query(Guid TeamId, Guid UserId, Guid? CardId)
        : IRequest<Result<List<TagDto>>>;

    internal sealed class Handler(AppDbContext db) : IRequestHandler<Query, Result<List<TagDto>>>
    {
        public async Task<Result<List<TagDto>>> Handle(Query req, CancellationToken ct)
        {
            bool isMember = await db.Members.AnyAsync(
                m => m.UserId == req.UserId && m.TeamId == req.TeamId,
                ct
            );

            if (!isMember)
                return Result.Fail("You are not a member of this team.");

            List<TagDto> tags = await db
                .Tags.Where(t => t.TeamId == req.TeamId)
                .OrderBy(t => t.Title)
                .Select(t => new TagDto(
                    t.Id,
                    t.Title,
                    t.Color,
                    t.CardTags.Count,
                    req.CardId.HasValue && t.CardTags.Any(ct2 => ct2.CardId == req.CardId.Value)
                ))
                .ToListAsync(ct);

            return Result.Ok(tags);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/tags",
                    async (
                        Guid teamId,
                        ClaimsPrincipal user,
                        ISender sender,
                        Guid? cardId = null
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Result<List<TagDto>> result = await sender.Send(
                            new Query(teamId, userId.Value, cardId)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<List<TagDto>>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
