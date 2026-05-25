using System.Security.Claims;
using Carter;
using Domain.Constants;
using Domain.Enums;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class UpdateTeam
{
    internal sealed record UpdateTeamRequest(string Name, int? AutoClosePeriodDays);

    internal sealed record UpdateTeamCommand(
        Guid TeamId,
        Guid UserId,
        string Name,
        int? AutoClosePeriodDays
    ) : IRequest<Result>;

    internal class UpdateTeamHandler(AppDbContext dbContext)
        : IRequestHandler<UpdateTeamCommand, Result>
    {
        public async Task<Result> Handle(
            UpdateTeamCommand request,
            CancellationToken cancellationToken
        )
        {
            var member = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Role })
                .FirstOrDefaultAsync(cancellationToken);

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            if (member.Role is not (TeamRole.Owner or TeamRole.Administrator))
                return Result.Fail("Only Owners and Administrators can update team settings.");

            int periodDays = request.AutoClosePeriodDays ?? 30;
            if (!AutoClosePolicy.IsValidPeriod(periodDays))
                return Result.Fail(
                    $"Invalid AutoClosePeriodDays. Valid values: {string.Join(", ", AutoClosePolicy.ValidPeriodDays.Order())}."
                );

            await dbContext
                .Teams.Where(t => t.Id == request.TeamId)
                .ExecuteUpdateAsync(
                    s =>
                        s.SetProperty(t => t.Name, request.Name)
                            .SetProperty(t => t.AutoClosePeriodDays, periodDays),
                    cancellationToken
                );

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}",
                    async (
                        Guid teamId,
                        ClaimsPrincipal user,
                        UpdateTeamRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new UpdateTeamCommand(
                                teamId,
                                userId.Value,
                                request.Name,
                                request.AutoClosePeriodDays
                            )
                        );

                        return result.ToNoContentMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
