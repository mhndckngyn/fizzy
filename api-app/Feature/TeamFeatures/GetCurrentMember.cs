using System.Security.Claims;
using Carter;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public class GetCurrentMember
{
    internal sealed record GetCurrentMemberQuery(Guid TeamId, Guid UserId)
        : IRequest<Result<CurrentMemberResponse>>;

    internal sealed record CurrentMemberResponse(
        Guid MemberId,
        string MemberName,
        TeamRole Role,
        bool CanManageTeam
    );

    internal class GetCurrentMemberHandler(AppDbContext dbContext)
        : IRequestHandler<GetCurrentMemberQuery, Result<CurrentMemberResponse>>
    {
        public async Task<Result<CurrentMemberResponse>> Handle(
            GetCurrentMemberQuery request,
            CancellationToken cancellationToken
        )
        {
            var member = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (member is null)
                return Result.Fail("You are not a member of this team.");

            return Result.Ok(
                new CurrentMemberResponse(member.Id, member.Name, member.Role, member.CanManageTeam)
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/members/me",
                    async (Guid teamId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new GetCurrentMemberQuery(teamId, userId.Value)
                        );

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
