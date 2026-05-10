using System.Security.Claims;
using Carter;
using Domain.Entities;
using Domain.Enums;
using Domain.ValueObjects;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class JoinTeam
{
    internal sealed record JoinTeamRequest(string InvitationCode, string MemberName);

    internal sealed record JoinTeamResponse(Guid TeamId, Guid MemberId, string MemberName);

    internal sealed record JoinTeamCommand(
        Guid UserId,
        InvitationCode InvitationCode,
        string MemberName
    ) : IRequest<Result<JoinTeamResponse>>;

    internal class JoinTeamHandler(AppDbContext dbContext)
        : IRequestHandler<JoinTeamCommand, Result<JoinTeamResponse>>
    {
        public async Task<Result<JoinTeamResponse>> Handle(
            JoinTeamCommand request,
            CancellationToken cancellationToken
        )
        {
            // Tìm team dựa trên InvitationCode
            var team = await dbContext
                .Teams.Where(t => t.InvitationCode == request.InvitationCode)
                .Include(t => t.Boards)
                .FirstOrDefaultAsync(cancellationToken);

            if (team is null)
            {
                return Result.Fail(
                    new Error($"No team found with the provided invitation code.").WithMetadata(
                        "HttpCode",
                        404
                    )
                );
            }

            // Kiểm tra xem người dùng đã là thành viên của team chưa
            bool isAlreadyMember = await dbContext.Members.AnyAsync(
                m => m.TeamId == team.Id && m.UserId == request.UserId,
                cancellationToken
            );
            if (isAlreadyMember)
            {
                return Result.Fail(
                    new Error($"You are already a member of this team.").WithMetadata(
                        "HttpCode",
                        400
                    )
                );
            }

            // Thêm thành viên mới vào team
            Member newMember = new()
            {
                TeamId = team.Id,
                UserId = request.UserId,
                Name = request.MemberName,
                Role = TeamRole.Member,
            };

            dbContext.Members.Add(newMember);

            // grant access to all current public boards
            IEnumerable<BoardAccess> publicBoardAccesses = team
                .Boards.Where(board => board.AllAccess)
                .Select(board => new BoardAccess(team.Id, board.Id, newMember.Id));

            dbContext.BoardAccesses.AddRange(publicBoardAccesses);

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new JoinTeamResponse(team.Id, newMember.Id, newMember.Name));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/join",
                    async (
                        ClaimsPrincipal user,
                        [FromBody] JoinTeamRequest request,
                        ISender sender
                    ) =>
                    {
                        // Kiểm tra xem người dùng đã đăng nhập chưa
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                        {
                            return Results.Unauthorized();
                        }

                        // Validate InvitationCode
                        Result<InvitationCode> invitationCodeResult = InvitationCode.Parse(
                            request.InvitationCode
                        );

                        if (invitationCodeResult.IsFailed)
                        {
                            return Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    invitationCodeResult.Errors.Select(x => x.Message)
                                )
                            );
                        }

                        // Tạo và gửi JoinTeamCommand
                        JoinTeamCommand command = new(
                            userId.Value,
                            invitationCodeResult.Value,
                            request.MemberName
                        );

                        // Xử lý kết quả trả về từ handler
                        Result<JoinTeamResponse> result = await sender.Send(command);
                        return result.ToMinimalApiResult();
                    }
                )
                .RequireAuthorization();
        }
    }
}
