using System.Security.Claims;
using Carter;
using Domain.ValueObjects;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class GetTeamInfoFromInvitationCode
{
    internal sealed record GetTeamInfoCommand(InvitationCode InvitationCode)
        : IRequest<Result<GetTeamInfoResponse>>;

    internal sealed record GetTeamInfoResponse(
        Guid TeamId,
        int ExternalTeamId,
        string TeamName,
        int MemberCount,
        string InvitationCode
    );

    internal class GetTeamInfoHandler(AppDbContext dbContext)
        : IRequestHandler<GetTeamInfoCommand, Result<GetTeamInfoResponse>>
    {
        public async Task<Result<GetTeamInfoResponse>> Handle(
            GetTeamInfoCommand request,
            CancellationToken cancellationToken
        )
        {
            var teamResponse = await dbContext
                .Teams.AsNoTracking()
                .Where(t => t.InvitationCode == request.InvitationCode)
                .Select(t => new GetTeamInfoResponse(
                    t.Id,
                    t.ExternalTeamId,
                    t.Name,
                    t.Members.Count,
                    t.InvitationCode!.Value
                ))
                .FirstOrDefaultAsync(cancellationToken);

            if (teamResponse is null)
            {
                return Result.Fail<GetTeamInfoResponse>(
                    $"Team with invitation code {request.InvitationCode.Value} not found."
                );
            }

            return Result.Ok(teamResponse);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/join/{invitationCode}",
                    async (ClaimsPrincipal user, string invitationCode, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();

                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        // Validate InvitationCode
                        Result<InvitationCode> invitationCodeResult = InvitationCode.Parse(
                            invitationCode
                        );

                        if (invitationCodeResult.IsFailed)
                        {
                            return Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    invitationCodeResult.Errors.Select(x => x.Message)
                                )
                            );
                        }

                        GetTeamInfoCommand command = new(invitationCodeResult.Value);

                        Result<GetTeamInfoResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<GetTeamInfoResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
