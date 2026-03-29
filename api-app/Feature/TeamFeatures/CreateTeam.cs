using System.Security.Claims;
using Carter;
using Domain.Entities;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;

namespace Feature.TeamFeatures;

public static class CreateTeam
{
    internal sealed record CreateTeamRequest(string TeamName, string MemberName);

    internal sealed record CreateTeamCommand(string TeamName, Guid OwnerUserId, string MemberName)
        : IRequest<Result<CreateTeamResponse>>;

    internal sealed record CreateTeamResponse(Guid TeamId, Guid MemberId);

    internal class CreateTeamHandler(AppDbContext dbContext)
        : IRequestHandler<CreateTeamCommand, Result<CreateTeamResponse>>
    {
        public async Task<Result<CreateTeamResponse>> Handle(
            CreateTeamCommand request,
            CancellationToken cancellationToken
        )
        {
            Member member = new()
            {
                UserId = request.OwnerUserId,
                Name = request.MemberName,
                Role = TeamRole.Owner,
            };

            Team team = new() { Name = request.TeamName, Members = { member } };

            dbContext.Teams.Add(team);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new CreateTeamResponse(team.Id, member.Id));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams",
                    async (ClaimsPrincipal user, CreateTeamRequest request, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();

                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        CreateTeamCommand command = new(
                            request.TeamName,
                            userId.Value,
                            request.MemberName
                        );

                        Result<CreateTeamResponse> result = await sender.Send(command);

                        return result.ToCreatedMinimalApiResult(val => $"/api/teams/{val.TeamId}");
                    }
                )
                .RequireAuthorization();
        }
    }
}
