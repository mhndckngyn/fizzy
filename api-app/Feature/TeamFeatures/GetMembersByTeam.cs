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

public class GetMembersByTeam
{
    internal sealed record GetTeamMembersQuery(Guid TeamId, Guid UserId)
        : IRequest<Result<GetTeamMembersResponse>>;

    internal sealed record MemberDto(
        Guid MemberId,
        string MemberName,
        string Email,
        TeamRole Role,
        bool CanBeManaged
    );

    internal sealed record GetTeamMembersResponse(IEnumerable<MemberDto> Members);

    internal class GetTeamMembersHandler(AppDbContext dbContext)
        : IRequestHandler<GetTeamMembersQuery, Result<GetTeamMembersResponse>>
    {
        public async Task<Result<GetTeamMembersResponse>> Handle(
            GetTeamMembersQuery request,
            CancellationToken cancellationToken
        )
        {
            Member? requester = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (requester is null)
                return Result.Fail("You are not a member of this team.");

            var members = await dbContext
                .Members.Where(m => m.TeamId == request.TeamId && m.RemovedAt == null)
                .Select(m => new
                {
                    m.Id,
                    m.Name,
                    m.Role,
                    Email = m.User!.EmailAddress,
                })
                .ToListAsync(cancellationToken);

            var result = members.Select(m => new MemberDto(
                m.Id,
                m.Name,
                m.Email,
                m.Role,
                CanBeManaged: requester.CanManage(m.Id, m.Role)
            ));

            return Result.Ok(new GetTeamMembersResponse(result));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/members",
                    async (Guid teamId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new GetTeamMembersQuery(teamId, userId.Value)
                        );

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
