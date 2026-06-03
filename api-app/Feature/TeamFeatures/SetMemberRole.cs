using System.Security.Claims;
using Carter;
using Domain.Entities;
using Domain.Enums;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class SetMemberRole
{
    internal sealed record SetMemberRoleCommand(
        Guid TeamId,
        Guid TargetMemberId,
        Guid RequestingUserId,
        TeamRole NewRole
    ) : IRequest<Result>;

    internal class SetMemberRoleHandler(AppDbContext dbContext)
        : IRequestHandler<SetMemberRoleCommand, Result>
    {
        public async Task<Result> Handle(
            SetMemberRoleCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? requester = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.RequestingUserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (requester is null)
                return Result.Fail("You are not a member of this team.");

            var target = await dbContext.Members.FirstOrDefaultAsync(
                m => m.Id == request.TargetMemberId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (target is null)
                return Result.Fail("Member not found.");

            if (!requester.CanManage(target.Id, target.Role))
                return Result.Fail("You do not have permission to manage this member.");

            target.Role = request.NewRole;
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}/members/{targetMemberId:guid}/promote",
                    async (
                        Guid teamId,
                        Guid targetMemberId,
                        ClaimsPrincipal user,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new SetMemberRoleCommand(
                                teamId,
                                targetMemberId,
                                userId.Value,
                                TeamRole.Administrator
                            )
                        );

                        return result.ToNoContentMinimalApiResult();
                    }
                )
                .RequireAuthorization();

            app.MapPut(
                    "/api/teams/{teamId:guid}/members/{targetMemberId:guid}/demote",
                    async (
                        Guid teamId,
                        Guid targetMemberId,
                        ClaimsPrincipal user,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new SetMemberRoleCommand(
                                teamId,
                                targetMemberId,
                                userId.Value,
                                TeamRole.Member
                            )
                        );

                        return result.ToNoContentMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
