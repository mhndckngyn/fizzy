using System.Security.Claims;
using System.Text.Json;
using Carter;
using Domain.AppEventMetadata;
using Domain.Entities;
using Domain.Enums;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeature;

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

    internal class UpdateCardHandler(AppDbContext dbContext)
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

            bool titleChanged = request.Title != null && request.Title != card.Title;
            if (titleChanged)
            {
                CardTitleChangeMetadata metadata = new()
                {
                    OldTitle = card.Title ?? "",
                    NewTitle = request.Title ?? "",
                };

                dbContext.Events.Add(
                    new Event(
                        appEventType: AppEvent.CardTitleChanged,
                        teamId: card.TeamId,
                        creatorMemberId: member.Id,
                        cardId: card.Id,
                        metadata: JsonSerializer.Serialize(metadata)
                    )
                );

                card.Touch();
            }

            card.Title = request.Title;

            CardContent? content = await dbContext.CardContents.FirstOrDefaultAsync(
                c => c.CardId == card.Id,
                cancellationToken
            );

            if (content is null)
                dbContext.CardContents.Add(
                    new CardContent { CardId = card.Id, Body = request.Body }
                );
            else
                content.Body = request.Body;

            if (request.MentionedMemberIds is { Count: > 0 })
            {
                CardMentionMetadata metadataObj = new()
                {
                    MentionedMemberIds = request.MentionedMemberIds,
                };
                Event mentionEvent = new(
                    appEventType: AppEvent.Mention,
                    teamId: card.TeamId,
                    creatorMemberId: member.Id,
                    cardId: card.Id,
                    metadata: JsonSerializer.Serialize(metadataObj)
                );
                dbContext.Events.Add(mentionEvent);
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new UpdateCardResponse(card.Id, card.No, card.Title));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut(
                    "/api/boards/{boardId:guid}/cards/{cardId:guid}", // TODO take teamId
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
