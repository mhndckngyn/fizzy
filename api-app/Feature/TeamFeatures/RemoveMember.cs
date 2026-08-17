using System.Security.Claims;
using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class RemoveMember
{
    internal sealed record RemoveMemberCommand(
        Guid TeamId,
        Guid TargetMemberId,
        Guid RequestingUserId
    ) : IRequest<Result>;

    internal class RemoveMemberHandler(AppDbContext dbContext, ISender sender)
        : IRequestHandler<RemoveMemberCommand, Result>
    {
        public async Task<Result> Handle(
            RemoveMemberCommand request,
            CancellationToken cancellationToken
        )
        {
            var requester = await dbContext.Members.FirstOrDefaultAsync(
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
                return Result.Fail("You do not have permission to remove this member.");

            if (target.RemovedAt is not null)
                return Result.Fail("Member has already been removed.");

            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                cancellationToken
            );

            try
            {
                await sender.Send(
                    new ClearMemberData.ClearMemberDataCommand(target),
                    cancellationToken
                );
                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete(
                    "/api/teams/{teamId:guid}/members/{targetMemberId:guid}",
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
                            new RemoveMemberCommand(teamId, targetMemberId, userId.Value)
                        );

                        return result.ToNoContentMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
