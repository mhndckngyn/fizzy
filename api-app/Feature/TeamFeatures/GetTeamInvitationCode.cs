using System.Security.Claims;
using Carter;
using Domain.ValueObjects;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class GetTeamInvitationCode
{
    internal sealed record GetTeamInvitationCodeCommand(Guid TeamId, Guid UserId)
        : IRequest<Result<GetTeamInvitationCodeResponse>>;

    internal sealed record GetTeamInvitationCodeResponse(string InvitationCode);

    internal class GetTeamInvitationCodeHandler(AppDbContext dbContext)
        : IRequestHandler<GetTeamInvitationCodeCommand, Result<GetTeamInvitationCodeResponse>>
    {
        public async Task<Result<GetTeamInvitationCodeResponse>> Handle(
            GetTeamInvitationCodeCommand request,
            CancellationToken cancellationToken
        )
        {
            var team = await dbContext
                .Teams.Where(t => t.Id == request.TeamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (team is null)
            {
                return Result.Fail(
                    new Error($"Team with ID {request.TeamId} not found").WithMetadata(
                        "HttpCode",
                        404
                    )
                );
            }

            // Kiểm tra xem người dùng có phải là thành viên của team không
            bool isMember = await dbContext.Members.AnyAsync(
                m => m.TeamId == request.TeamId && m.UserId == request.UserId,
                cancellationToken
            );
            if (!isMember)
            {
                return Result.Fail(
                    new Error($"You are not a member of this team").WithMetadata("HttpCode", 403)
                );
            }

            // Nếu chưa có InvitationCode, tạo mới và lưu vào database
            InvitationCode invitationCode = await CreateInvitationCode.GetOrGenerateAsync(
                dbContext,
                team,
                cancellationToken
            );
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new GetTeamInvitationCodeResponse(invitationCode.Value));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId}/invitation-code",
                    async (ClaimsPrincipal user, Guid teamId, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();

                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        GetTeamInvitationCodeCommand command = new(teamId, userId.Value);

                        Result<GetTeamInvitationCodeResponse> result = await sender.Send(command);

                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
