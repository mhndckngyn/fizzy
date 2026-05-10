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

public static class CreateCard
{
    internal sealed record CreateCardRequest(
        string? Title,
        string? Body,
        List<Guid>? AssignedMemberIds,
        List<Guid>? MentionedMemberIds
    );

    internal sealed record CreateCardCommand(
        string? Title,
        string? Body,
        List<Guid>? AssignedMemberIds,
        List<Guid>? MentionedMemberIds,
        Guid TeamId,
        Guid BoardId,
        Guid UserId
    ) : IRequest<Result<CreateCardResponse>>;

    internal sealed record CreateCardResponse(Guid CardId, int No, string? Title);

    internal class CreateCardHandler(AppDbContext dbContext, ISender sender)
        : IRequestHandler<CreateCardCommand, Result<CreateCardResponse>>
    {
        public async Task<Result<CreateCardResponse>> Handle(
            CreateCardCommand request,
            CancellationToken cancellationToken
        )
        {
            // Lấy member + teamId trong 1 query
            var memberInfo = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => new { m.Id, m.TeamId })
                .FirstOrDefaultAsync(cancellationToken);

            if (memberInfo is null)
                return Result.Fail("You are not a member of this board.");

            Guid teamId = request.TeamId;

            // Tăng CardsCount của team và lấy No mới
            // Dùng ExecuteUpdate để atomic increment, tránh race condition
            int updatedRows = await dbContext
                .Teams.Where(t => t.Id == teamId)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(t => t.CardsCount, t => t.CardsCount + 1),
                    cancellationToken
                );

            if (updatedRows == 0)
                return Result.Fail("Team not found.");

            // Lấy CardsCount mới sau khi increment
            long newNo = await dbContext
                .Teams.Where(t => t.Id == teamId)
                .Select(t => t.CardsCount)
                .FirstAsync(cancellationToken);

            Domain.Entities.Card card = new()
            {
                No = (int)newNo,
                Title = request.Title,
                TeamId = teamId,
                BoardId = request.BoardId,
                CreatorMemberId = memberInfo.Id,
            };

            CardContent content = new() { CardId = card.Id, Body = request.Body };

            CardMaybe maybe = new() { CardId = card.Id, BoardId = request.BoardId };

            Event createEvent = new(
                appEventType: AppEvent.CardCreate,
                teamId: teamId,
                creatorMemberId: memberInfo.Id,
                cardId: card.Id
            );

            CardWatch creatorCardWatch = new(teamId, card.Id, memberInfo.Id);

            dbContext.AddRange(card, content, maybe, createEvent, creatorCardWatch);

            // Xử lý assignments nếu có
            if (request.AssignedMemberIds is { Count: > 0 })
            {
                // Validate các memberId đều thuộc team, tránh FK violation
                var validMemberIds = await dbContext
                    .Members.Where(m =>
                        m.TeamId == teamId && request.AssignedMemberIds.Contains(m.Id)
                    )
                    .Select(m => m.Id)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                var assignments = validMemberIds.Select(assigneeId => new CardAssignment
                {
                    CardId = card.Id,
                    BoardId = request.BoardId,
                    AssignerMemberId = memberInfo.Id,
                    AssigneeMemberId = assigneeId,
                });

                IEnumerable<Event> assignmentEvents = validMemberIds.Select(assigneeId =>
                {
                    CardAssignMetadata metadataObj = new() { AssignedMemberId = assigneeId };
                    return new Event(
                        appEventType: AppEvent.CardAssign,
                        teamId: teamId,
                        creatorMemberId: memberInfo.Id,
                        cardId: card.Id,
                        metadata: JsonSerializer.Serialize(metadataObj)
                    );
                });

                dbContext.CardAssignments.AddRange(assignments);
                dbContext.Events.AddRange(assignmentEvents);
            }

            // Process mentions
            if (request.MentionedMemberIds is { Count: > 0 } mentionIds)
            {
                CardMentionMetadata metadataObj = new() { MentionedMemberIds = mentionIds };
                Event mentionEvent = new(
                    appEventType: AppEvent.Mention,
                    teamId: teamId,
                    creatorMemberId: memberInfo.Id,
                    cardId: card.Id,
                    metadata: JsonSerializer.Serialize(metadataObj)
                );
                // TODO subscribe the mentioned members (do the same for UpdateCard)
                dbContext.Events.Add(mentionEvent);
            }
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new CreateCardResponse(card.Id, card.No, card.Title));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards", // TODO put board in body
                    async (
                        Guid teamId,
                        Guid boardId,
                        ClaimsPrincipal user,
                        CreateCardRequest request,
                        ISender sender
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        CreateCardCommand command = new(
                            request.Title,
                            request.Body,
                            request.AssignedMemberIds,
                            request.MentionedMemberIds,
                            teamId,
                            boardId,
                            userId.Value
                        );

                        Result<CreateCardResponse> result = await sender.Send(command);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Created(
                                $"/api/cards/{result.Value.CardId}",
                                new SuccessResponse<CreateCardResponse>(result.Value)
                            );
                    }
                )
                .RequireAuthorization();
        }
    }
}
