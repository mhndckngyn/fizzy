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

public static class GetTeamInfo
{
    internal sealed record GetTeamInfoCommand(Guid TeamId, Guid UserId)
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
            var team = await dbContext
                .Teams.Where(t => t.Id == request.TeamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (team is null)
            {
                return Result.Fail<GetTeamInfoResponse>($"Team with ID {request.TeamId} not found");
            }

            // Kiểm tra xem người dùng có phải là thành viên của team không
            bool isMember = await dbContext.Members.AnyAsync(
                m => m.TeamId == request.TeamId && m.UserId == request.UserId,
                cancellationToken
            );
            if (!isMember)
            {
                return Result.Fail<GetTeamInfoResponse>($"You are not a member of this team");
            }

            int memberCount = await dbContext.Members.CountAsync(
                m => m.TeamId == team.Id,
                cancellationToken
            );

            // Nếu chưa có InvitationCode, tạo mới và lưu vào database
            InvitationCode invitationCode = await CreateInvitationCode.GetOrGenerateAsync(
                dbContext,
                team,
                cancellationToken
            );
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(
                new GetTeamInfoResponse(
                    team.Id,
                    team.ExternalTeamId,
                    team.Name,
                    memberCount,
                    invitationCode.Value
                )
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId}/info",
                    async (ClaimsPrincipal user, Guid teamId, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();

                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        GetTeamInfoCommand command = new(teamId, userId.Value);

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
