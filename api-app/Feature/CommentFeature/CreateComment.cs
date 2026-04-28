using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures.Comments;

public static class CreateComment
{
    internal sealed record CreateCommentRequest(string Body);

    internal sealed record CreateCommentCommand(Guid TeamId, Guid CardId, string Body, Guid UserId)
        : IRequest<Result<GetComments.CommentDto>>;

    internal class CreateCommentHandler(AppDbContext dbContext)
        : IRequestHandler<CreateCommentCommand, Result<GetComments.CommentDto>>
    {
        public async Task<Result<GetComments.CommentDto>> Handle(
            CreateCommentCommand request,
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
                return Result.Fail("You are not a member of this team.");

            bool cardExists = await dbContext.Cards.AnyAsync(
                c => c.Id == request.CardId && c.TeamId == request.TeamId,
                cancellationToken
            );

            if (!cardExists)
                return Result.Fail("Card not found.");

            var comment = new Comment
            {
                CardId = request.CardId,
                CreatorMemberId = member.Id,
                Body = request.Body.Trim(),
            };

            dbContext.Comments.Add(comment);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(
                new GetComments.CommentDto(
                    comment.Id,
                    comment.Body,
                    member.Name,
                    member.Id,
                    comment.CreatedAt,
                    EditedAt: null,
                    IsOwner: true
                )
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}/comments",
                    async (
                        Guid teamId,
                        Guid cardId,
                        ClaimsPrincipal user,
                        CreateCommentRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new CreateCommentCommand(teamId, cardId, request.Body, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Created(
                                $"/api/teams/{teamId}/cards/{cardId}/comments/{result.Value.CommentId}",
                                new SuccessResponse<GetComments.CommentDto>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
