using System.Security.Claims;
using Carter;
using Domain.Entities;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class CreateCard
{
    internal sealed record CreateCardRequest(string? Title, string? Body);

    internal sealed record CreateCardCommand(string? Title, string? Body, Guid BoardId, Guid UserId)
        : IRequest<Result<CreateCardResponse>>;

    internal sealed record CreateCardResponse(Guid CardId, string? Title);

    internal class CreateCardHandler(AppDbContext dbContext, ISender sender)
        : IRequestHandler<CreateCardCommand, Result<CreateCardResponse>>
    {
        public async Task<Result<CreateCardResponse>> Handle(
            CreateCardCommand request,
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

            Card card = new()
            {
                Title = request.Title,
                BoardId = request.BoardId,
                CreatorMemberId = member.Id,
            };

            CardMaybe maybe = new() { CardId = card.Id, BoardId = request.BoardId };

            dbContext.Cards.Add(card);
            dbContext.CardMaybes.Add(maybe);
            await dbContext.SaveChangesAsync(cancellationToken);

            await sender.Send(
                new CreateCardContent.CreateCardContentCommand(card.Id, request.Body),
                cancellationToken
            );

            return Result.Ok(new CreateCardResponse(card.Id, card.Title));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost(
                    "/api/boards/{boardId:guid}/cards",
                    async (
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
