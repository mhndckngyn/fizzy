using Carter;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public class GetMembersByTeam
{
    internal sealed record GetTeamMembersCommand(Guid TeamId)
        : IRequest<Result<GetTeamMembersResponse>>;

    internal sealed record GetTeamMembersResponse(IEnumerable<MemberDto> Members);

    internal sealed record MemberDto(Guid MemberId, string MemberName);

    internal class GetTeamMembersHandler(AppDbContext dbContext)
        : IRequestHandler<GetTeamMembersCommand, Result<GetTeamMembersResponse>>
    {
        public async Task<Result<GetTeamMembersResponse>> Handle(
            GetTeamMembersCommand command,
            CancellationToken cancellationToken
        )
        {
            IEnumerable<MemberDto> members = await dbContext
                .Members.AsNoTracking()
                .Where(m => m.TeamId == command.TeamId)
                .Select(m => new MemberDto(m.Id, m.Name))
                .ToListAsync(cancellationToken);

            GetTeamMembersResponse response = new(members);

            return Result.Ok(response);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/members",
                    async (Guid teamId, ISender sender) =>
                    {
                        GetTeamMembersCommand commmand = new(teamId);

                        Result<GetTeamMembersResponse> result = await sender.Send(commmand);

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
