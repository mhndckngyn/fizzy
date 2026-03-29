using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class GetAllTeamsByUser
{
    internal sealed record GetTeamsCommand(Guid UserId) : IRequest<Result<GetTeamsResponse>>;

    internal sealed record GetTeamsResponse(List<TeamDto> Teams);

    internal sealed record TeamDto(Guid TeamId, int ExternalTeamId, string Name, int MemberCount);

    internal class GetTeamsHandler(AppDbContext dbContext)
        : IRequestHandler<GetTeamsCommand, Result<GetTeamsResponse>>
    {
        public async Task<Result<GetTeamsResponse>> Handle(
            GetTeamsCommand request,
            CancellationToken cancellationToken
        )
        {
            List<TeamDto> teams = await dbContext
                .Teams.Where(t => t.Members.Any(m => m.UserId == request.UserId))
                .Select(t => new TeamDto(t.Id, t.ExternalTeamId, t.Name, t.Members.Count))
                .ToListAsync(cancellationToken);

            return Result.Ok(new GetTeamsResponse(teams));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams",
                    async (ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();

                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        GetTeamsCommand command = new(userId.Value);

                        Result<GetTeamsResponse> result = await sender.Send(command);

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
