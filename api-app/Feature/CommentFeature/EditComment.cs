using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures.Comments;

public static class EditComment
{
    internal sealed record EditCommentRequest(string Body);

    internal sealed record EditCommentCommand(Guid TeamId, Guid CommentId, string Body, Guid UserId)
        : IRequest<Result<GetComments.CommentDto>>;

    internal class EditCommentHandler(AppDbContext dbContext)
        : IRequestHandler<EditCommentCommand, Result<GetComments.CommentDto>>
    {
        public async Task<Result<GetComments.CommentDto>> Handle(
            EditCommentCommand request,
            CancellationToken cancellationToken
        )
        {
            if (string.IsNullOrWhiteSpace(request.Body))
                return Result.Fail("Comment body cannot be empty.");

            var member = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Id, m.Name })
                .FirstOrDefaultAsync(cancellationToken);

            if (member is null)
                return Result.Fail("Member not found.");

            var comment = await dbContext.Comments.FirstOrDefaultAsync(
                c => c.Id == request.CommentId,
                cancellationToken
            );

            if (comment is null)
                return Result.Fail("Comment not found.");

            if (comment.CreatorMemberId != member.Id)
                return Result.Fail("You can only edit your own comments.");

            comment.Body = request.Body.Trim();

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(
                new GetComments.CommentDto(
                    comment.Id,
                    comment.Body,
                    member.Name,
                    member.Id,
                    comment.CreatedAt,
                    comment.UpdatedAt,
                    IsOwner: true
                )
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/teams/{teamId:guid}/comments/{commentId:guid}",
                    async (
                        Guid teamId,
                        Guid commentId,
                        ClaimsPrincipal user,
                        EditCommentRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new EditCommentCommand(teamId, commentId, request.Body, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<GetComments.CommentDto>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
