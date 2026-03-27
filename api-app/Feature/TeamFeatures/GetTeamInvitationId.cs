using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class GetTeamInvitationId
{
    private static readonly string CHARS =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    internal sealed record GetTeamInvitationIdCommand(Guid TeamId)
        : IRequest<Result<GetTeamInvitationIdResponse>>;

    internal sealed record GetTeamInvitationIdResponse(string InvitationId);

    internal class GetTeamInvitationIdHandler(AppDbContext dbContext)
        : IRequestHandler<GetTeamInvitationIdCommand, Result<GetTeamInvitationIdResponse>>
    {
        public async Task<Result<GetTeamInvitationIdResponse>> Handle(
            GetTeamInvitationIdCommand request,
            CancellationToken cancellationToken
        )
        {
            var team = await dbContext
                .Teams.Where(t => t.Id == request.TeamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (team is null)
            {
                return Result.Fail<GetTeamInvitationIdResponse>(
                    $"Team with ID {request.TeamId} not found"
                );
            }

            // Nếu chưa có InvitationId, tạo mới và lưu vào database
            if (string.IsNullOrEmpty(team.InvitationId))
            {
                string newInvitationId = string.Empty;
                bool isUnique = false;

                while (!isUnique)
                {
                    newInvitationId = GenerateCustomId();

                    bool isExists = await dbContext.Teams.AnyAsync(
                        t => t.InvitationId == newInvitationId,
                        cancellationToken
                    );

                    if (!isExists)
                    {
                        isUnique = true;
                    }
                }

                team.InvitationId = newInvitationId;
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return Result.Ok(new GetTeamInvitationIdResponse(team.InvitationId));
        }

        private static string GenerateCustomId()
        {
            var random = new Random();

            string GetRandomPart() =>
                new([.. Enumerable.Repeat(CHARS, 4).Select(s => s[random.Next(s.Length)])]);

            return $"{GetRandomPart()}-{GetRandomPart()}-{GetRandomPart()}";
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId}/invitation-id",
                    async (ClaimsPrincipal user, Guid teamId, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();

                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        GetTeamInvitationIdCommand command = new(teamId);

                        Result<GetTeamInvitationIdResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.NotFound(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(
                                new SuccessResponse<GetTeamInvitationIdResponse>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
