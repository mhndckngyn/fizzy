using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures.Comments;

public static class DeleteComment
{
    internal sealed record DeleteCommentCommand(Guid TeamId, Guid CommentId, Guid UserId)
        : IRequest<Result>;

    internal class DeleteCommentHandler(AppDbContext dbContext)
        : IRequestHandler<DeleteCommentCommand, Result>
    {
        public async Task<Result> Handle(
            DeleteCommentCommand request,
            CancellationToken cancellationToken
        )
        {
            var memberId = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => m.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (memberId == Guid.Empty)
                return Result.Fail("Member not found.");

            var comment = await dbContext.Comments.FirstOrDefaultAsync(
                c => c.Id == request.CommentId,
                cancellationToken
            );

            if (comment is null)
                return Result.Fail("Comment not found.");

            if (comment.CreatorMemberId != memberId)
                return Result.Fail("You can only delete your own comments.");

            dbContext.Comments.Remove(comment);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete(
                    "/api/teams/{teamId:guid}/comments/{commentId:guid}",
                    async (Guid teamId, Guid commentId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new DeleteCommentCommand(teamId, commentId, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
