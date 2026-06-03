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

public static class ToggleCardGolden
{
    internal sealed record ToggleCardGoldenCommand(Guid CardId, Guid TeamId, Guid UserId)
        : IRequest<Result<ToggleCardGoldenResponse>>;

    internal sealed record ToggleCardGoldenResponse(bool IsGolden);

    internal class Handler(AppDbContext dbContext)
        : IRequestHandler<ToggleCardGoldenCommand, Result<ToggleCardGoldenResponse>>
    {
        public async Task<Result<ToggleCardGoldenResponse>> Handle(
            ToggleCardGoldenCommand request,
            CancellationToken cancellationToken
        )
        {
            var member = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Id })
                .FirstOrDefaultAsync(cancellationToken);

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            // Verify card belongs to this team
            var cardExists = await dbContext.Cards.AnyAsync(
                c => c.Id == request.CardId && c.TeamId == request.TeamId,
                cancellationToken
            );

            if (!cardExists)
                return Result.Fail("Card not found.");

            var existing = await dbContext.CardGoldnesses.FirstOrDefaultAsync(
                g => g.CardId == request.CardId,
                cancellationToken
            );

            bool isGolden;

            if (existing is null)
            {
                dbContext.CardGoldnesses.Add(
                    new CardGolden { CardId = request.CardId, TeamId = request.TeamId }
                );
                isGolden = true;
            }
            else
            {
                dbContext.CardGoldnesses.Remove(existing);
                isGolden = false;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new ToggleCardGoldenResponse(isGolden));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/golden",
                    async (Guid teamId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var command = new ToggleCardGoldenCommand(cardId, teamId, userId.Value);
                        var result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(
                                new SuccessResponse<ToggleCardGoldenResponse>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
