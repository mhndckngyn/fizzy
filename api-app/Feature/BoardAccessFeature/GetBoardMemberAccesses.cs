using System.Security.Claims;
using Carter;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.BoardAccessFeature;

public static class GetBoardMemberAccesses
{
    internal sealed record GetBoardMemberAccessesQuery(Guid TeamId, Guid BoardId, Guid UserId)
        : IRequest<Result<GetBoardMemberAccessesResponse>>;

    internal sealed record MemberAccessEntry(
        Guid MemberId,
        string Name,
        string Email,
        bool HasAccess
    );

    internal sealed record GetBoardMemberAccessesResponse(
        bool CanManage,
        bool AllAccess,
        IEnumerable<MemberAccessEntry> Members
    );

    internal class GetBoardMemberAccessesHandler(AppDbContext dbContext)
        : IRequestHandler<GetBoardMemberAccessesQuery, Result<GetBoardMemberAccessesResponse>>
    {
        public async Task<Result<GetBoardMemberAccessesResponse>> Handle(
            GetBoardMemberAccessesQuery request,
            CancellationToken cancellationToken
        )
        {
            var requester = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Id, m.Role })
                .FirstOrDefaultAsync(cancellationToken);

            if (requester is null)
                return Result.Fail("You are not a member of this team.");

            var board = await dbContext
                .Boards.Where(b => b.Id == request.BoardId && b.TeamId == request.TeamId)
                .Select(b => new { b.AllAccess })
                .FirstOrDefaultAsync(cancellationToken);

            if (board is null)
                return Result.Fail("Board not found.");

            var accessedMemberIds = await dbContext
                .BoardAccesses.Where(ba => ba.BoardId == request.BoardId)
                .Select(ba => ba.MemberId)
                .ToHashSetAsync(cancellationToken);

            var members = await dbContext
                .Members.Where(m => m.TeamId == request.TeamId && m.RemovedAt == null)
                .Select(m => new MemberAccessEntry(
                    m.Id,
                    m.Name,
                    m.User!.EmailAddress,
                    accessedMemberIds.Contains(m.Id)
                ))
                .ToListAsync(cancellationToken);

            bool canManage = requester.Role is TeamRole.Owner or TeamRole.Administrator;

            return Result.Ok(
                new GetBoardMemberAccessesResponse(canManage, board.AllAccess, members)
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/accesses",
                    async (Guid teamId, Guid boardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new GetBoardMemberAccessesQuery(teamId, boardId, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(
                                new SuccessResponse<GetBoardMemberAccessesResponse>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
