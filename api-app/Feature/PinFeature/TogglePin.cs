using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.PinFeatures;

public static class TogglePin
{
    internal sealed record TogglePinCommand(Guid CardId, Guid TeamId, Guid UserId)
        : IRequest<Result<TogglePinResponse>>;

    internal sealed record TogglePinResponse(bool Pinned);

    internal class TogglePinHandler(AppDbContext dbContext)
        : IRequestHandler<TogglePinCommand, Result<TogglePinResponse>>
    {
        public async Task<Result<TogglePinResponse>> Handle(
            TogglePinCommand request,
            CancellationToken ct
        )
        {
            var member = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Id })
                .FirstOrDefaultAsync(ct);

            if (member is null)
                return Result.Fail("Not a member of this team.");

            var existing = await dbContext.Pins.FirstOrDefaultAsync(
                p => p.CardId == request.CardId && p.MemberId == member.Id,
                ct
            );

            if (existing is not null)
            {
                dbContext.Pins.Remove(existing);
                await dbContext.SaveChangesAsync(ct);
                return Result.Ok(new TogglePinResponse(Pinned: false));
            }

            dbContext.Pins.Add(
                new Domain.Entities.Pin
                {
                    CardId = request.CardId,
                    MemberId = member.Id,
                    TeamId = request.TeamId,
                }
            );
            await dbContext.SaveChangesAsync(ct);
            return Result.Ok(new TogglePinResponse(Pinned: true));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // POST /api/teams/{teamId}/cards/{cardId}/pin  → toggle
            app.MapPost(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/pin",
                    async (Guid teamId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        var userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new TogglePinCommand(cardId, teamId, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<TogglePinResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
