using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class GetCardAssignees
{
    internal sealed record GetCardAssigneesQuery(Guid CardId, Guid BoardId, Guid RequesterUserId)
        : IRequest<Result<IEnumerable<CardMemberAssignmentResponse>>>;

    internal sealed record CardMemberAssignmentResponse(
        Guid MemberId,
        string MemberName,
        bool IsAssigned
    );

    internal class GetCardAssigneesHandler(AppDbContext dbContext)
        : IRequestHandler<GetCardAssigneesQuery, Result<IEnumerable<CardMemberAssignmentResponse>>>
    {
        public async Task<Result<IEnumerable<CardMemberAssignmentResponse>>> Handle(
            GetCardAssigneesQuery request,
            CancellationToken cancellationToken
        )
        {
            // Lấy board để biết teamId, đồng thời verify requester là member của board
            var board = await dbContext
                .Boards.Where(b => b.Id == request.BoardId)
                .Select(b => new { b.TeamId })
                .FirstOrDefaultAsync(cancellationToken);

            if (board is null)
                return Result.Fail("Board not found.");

            bool isRequesterMember = await dbContext.Members.AnyAsync(
                m => m.UserId == request.RequesterUserId && m.TeamId == board.TeamId,
                cancellationToken
            );

            if (!isRequesterMember)
                return Result.Fail("You are not a member of this board.");

            bool cardExists = await dbContext.Cards.AnyAsync(
                c => c.Id == request.CardId && c.BoardId == request.BoardId,
                cancellationToken
            );

            if (!cardExists)
                return Result.Fail("Card not found in this board.");

            // Lấy danh sách memberId đã được assign vào card này
            var assignedMemberIds = await dbContext
                .CardAssignments.Where(a => a.CardId == request.CardId)
                .Select(a => a.AssigneeMemberId)
                .ToHashSetAsync(cancellationToken);

            // Lấy toàn bộ members trong team, gắn IsAssigned
            var members = await dbContext
                .Members.Where(m => m.TeamId == board.TeamId)
                .OrderBy(m => m.Name)
                .Select(m => new CardMemberAssignmentResponse(
                    m.Id,
                    m.Name,
                    assignedMemberIds.Contains(m.Id)
                ))
                .ToListAsync(cancellationToken);

            return Result.Ok<IEnumerable<CardMemberAssignmentResponse>>(members);
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}/assignments",
                    async (Guid boardId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        GetCardAssigneesQuery query = new(cardId, boardId, userId.Value);

                        Result<IEnumerable<CardMemberAssignmentResponse>> result =
                            await sender.Send(query);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(
                                new SuccessResponse<IEnumerable<CardMemberAssignmentResponse>>(
                                    result.Value
                                )
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
