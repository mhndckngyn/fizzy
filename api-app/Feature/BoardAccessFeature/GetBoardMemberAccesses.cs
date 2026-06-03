using System.Security.Claims;
using Carter;
using Domain.Entities;
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
            Member? requester = await dbContext.Members.FirstOrDefaultAsync(
                m => m.UserId == request.UserId && m.TeamId == request.TeamId,
                cancellationToken
            );

            if (requester is null)
                return Result.Fail("You are not a member of this team.");

            Board? board = await dbContext.Boards.FirstOrDefaultAsync(
                b => b.Id == request.BoardId && b.TeamId == request.TeamId,
                cancellationToken
            );

            if (board is null)
                return Result.Fail("Board not found.");

            var accessedMemberIds = await dbContext
                .BoardAccesses.Where(ba => ba.BoardId == request.BoardId)
                .Select(ba => ba.MemberId)
                .ToHashSetAsync(cancellationToken);

            var members = await dbContext
                .Members.Where(m => m.TeamId == request.TeamId && m.RemovedAt == null)
                .OrderBy(m => m.Name)
                .Select(m => new MemberAccessEntry(
                    m.Id,
                    m.Name,
                    m.User!.EmailAddress,
                    accessedMemberIds.Contains(m.Id)
                ))
                .ToListAsync(cancellationToken);

            return Result.Ok(
                new GetBoardMemberAccessesResponse(
                    board.CanBeUpdatedBy(requester),
                    board.AllAccess,
                    members
                )
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
