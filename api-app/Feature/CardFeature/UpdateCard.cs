using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using Feature.NotificationFeature;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class UpdateCard
{
    internal sealed record UpdateCardRequest(
        string? Title,
        string? Body,
        List<Guid>? MentionedMemberIds
    );

    internal sealed record UpdateCardCommand(
        Guid CardId,
        Guid BoardId,
        Guid UserId,
        string? Title,
        string? Body,
        List<Guid>? MentionedMemberIds
    ) : IRequest<Result<UpdateCardResponse>>;

    internal sealed record UpdateCardResponse(Guid CardId, int No, string? Title);

    internal class UpdateCardHandler(AppDbContext dbContext, ISender sender)
        : IRequestHandler<UpdateCardCommand, Result<UpdateCardResponse>>
    {
        public async Task<Result<UpdateCardResponse>> Handle(
            UpdateCardCommand request,
            CancellationToken cancellationToken
        )
        {
            Member? member = await dbContext.Members.FirstOrDefaultAsync(
                m =>
                    m.UserId == request.UserId
                    && dbContext.Boards.Any(b => b.Id == request.BoardId && b.TeamId == m.TeamId),
                cancellationToken
            );

            if (member is null)
                return Result.Fail("You are not a member of this board.");

            var card = await dbContext.Cards.FirstOrDefaultAsync(
                c => c.Id == request.CardId && c.BoardId == request.BoardId,
                cancellationToken
            );

            if (card is null)
                return Result.Fail("Card not found.");

            card.Title = request.Title;

            await dbContext.SaveChangesAsync(cancellationToken);

            await sender.Send(
                new UpdateCardContent.UpdateCardContentCommand(card.Id, request.Body),
                cancellationToken
            );

            if (request.MentionedMemberIds is { Count: > 0 })
                await sender.Send(
                    new SendNotification.SendNotificationCommand(
                        request.MentionedMemberIds,
                        card.Id,
                        member.Id,
                        NotificationType.Mention
                    ),
                    cancellationToken
                );

            return Result.Ok(new UpdateCardResponse(card.Id, card.No, card.Title));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}",
                    async (
                        Guid boardId,
                        Guid cardId,
                        ClaimsPrincipal user,
                        UpdateCardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        UpdateCardCommand command = new(
                            cardId,
                            boardId,
                            userId.Value,
                            request.Title,
                            request.Body,
                            request.MentionedMemberIds
                        );

                        Result<UpdateCardResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<UpdateCardResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
