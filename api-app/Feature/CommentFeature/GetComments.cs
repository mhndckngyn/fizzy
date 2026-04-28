using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures.Comments;

public static class GetComments
{
    internal sealed record GetCommentsQuery(Guid TeamId, Guid CardId, Guid UserId)
        : IRequest<Result<GetCommentsResponse>>;

    public sealed record CommentDto(
        Guid CommentId,
        string Body,
        string CreatorName,
        Guid CreatorMemberId,
        DateTime CreatedAt,
        DateTime? EditedAt,
        bool IsOwner
    );

    public sealed record GetCommentsResponse(List<CommentDto> Comments);

    internal class GetCommentsHandler(AppDbContext dbContext)
        : IRequestHandler<GetCommentsQuery, Result<GetCommentsResponse>>
    {
        public async Task<Result<GetCommentsResponse>> Handle(
            GetCommentsQuery request,
            CancellationToken cancellationToken
        )
        {
            var currentMemberId = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => m.Id)
                .FirstOrDefaultAsync(cancellationToken);

            var comments = await dbContext
                .Comments.Where(c => c.CardId == request.CardId)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto(
                    c.Id,
                    c.Body,
                    c.Creator.Name,
                    c.CreatorMemberId,
                    c.CreatedAt,
                    c.UpdatedAt,
                    c.CreatorMemberId == currentMemberId
                ))
                .ToListAsync(cancellationToken);

            return Result.Ok(new GetCommentsResponse(comments));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/comments",
                    async (Guid teamId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new GetCommentsQuery(teamId, cardId, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<GetCommentsResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
