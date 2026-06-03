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

public static class CreateTag
{
    internal sealed record Request(string Title, string Color);

    internal sealed record Command(Guid TeamId, string Title, string Color, Guid UserId)
        : IRequest<Result<ListTags.TagDto>>;

    internal sealed class Handler(AppDbContext db)
        : IRequestHandler<Command, Result<ListTags.TagDto>>
    {
        public async Task<Result<ListTags.TagDto>> Handle(Command req, CancellationToken ct)
        {
            bool isMember = await db.Members.AnyAsync(
                m => m.UserId == req.UserId && m.TeamId == req.TeamId,
                ct
            );

            if (!isMember)
                return Result.Fail("You are not a member of this team.");

            if (string.IsNullOrWhiteSpace(req.Title))
                return Result.Fail("Tag title cannot be empty.");

            if (string.IsNullOrWhiteSpace(req.Color))
                return Result.Fail("Tag color cannot be empty.");

            bool titleExists = await db.Tags.AnyAsync(
                t => t.TeamId == req.TeamId && t.Title == req.Title.Trim(),
                ct
            );

            if (titleExists)
                return Result.Fail("A tag with this title already exists.");

            Tag tag = new()
            {
                TeamId = req.TeamId,
                Title = req.Title.Trim(),
                Color = req.Color,
            };

            db.Tags.Add(tag);
            await db.SaveChangesAsync(ct);

            return Result.Ok(new ListTags.TagDto(tag.Id, tag.Title, tag.Color, 1, true));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/{teamId:guid}/tags",
                    async (Guid teamId, ClaimsPrincipal user, Request request, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Command command = new(teamId, request.Title, request.Color, userId.Value);
                        Result<ListTags.TagDto> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.Created(
                                $"/api/teams/{teamId}/tags",
                                new SuccessResponse<ListTags.TagDto>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
