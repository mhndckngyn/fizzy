using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class GetCard
{
    internal sealed record GetCardQuery(Guid CardId, Guid TeamId, Guid UserId)
        : IRequest<Result<GetCardResponse>>;

    internal sealed record GetCardAssignee(Guid MemberId, string Name);

    internal sealed record GetCardTag(Guid TagId, string Title, string Color);

    internal sealed record GetCardResponse(
        Guid CardId,
        int No,
        string? Title,
        string? Body,
        Guid BoardId,
        Guid? ColumnId,
        Guid? MaybeId,
        Guid? DoneId,
        Guid? NotNowId,
        string CreatorName,
        DateTime CreatedAt,
        DateTime LastActiveAt,
        int AutoClosePeriodDays,
        List<GetCardAssignee> Assignments,
        bool IsWatching,
        bool IsGolden,
        List<GetCardTag> Tags
    );

    internal class GetCardHandler(AppDbContext dbContext)
        : IRequestHandler<GetCardQuery, Result<GetCardResponse>>
    {
        public async Task<Result<GetCardResponse>> Handle(
            GetCardQuery request,
            CancellationToken cancellationToken
        )
        {
            Guid? memberId = await dbContext
                .Members.Where(m => m.UserId == request.UserId && m.TeamId == request.TeamId)
                .Select(m => (Guid?)m.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (memberId is null)
                return Result.Fail("You are not a member of this team.");

            var card = await dbContext
                .Cards.Where(c => c.Id == request.CardId && c.TeamId == request.TeamId)
                .Select(c => new
                {
                    c.Id,
                    c.No,
                    c.Title,
                    c.BoardId,
                    c.ColumnId,
                    c.CreatedAt,
                    c.LastActiveAt,
                    AutoClosePeriodDays = c.Board.AutoClosePeriodDays
                        ?? c.Board.Team.AutoClosePeriodDays,
                    CreatorName = dbContext
                        .Members.Where(m => m.Id == c.CreatorMemberId)
                        .Select(m => m.Name)
                        .FirstOrDefault(),
                    Body = dbContext
                        .CardContents.Where(cc => cc.CardId == c.Id)
                        .Select(cc => cc.Body)
                        .FirstOrDefault(),
                    MaybeId = dbContext
                        .CardMaybes.Where(cm => cm.CardId == c.Id)
                        .Select(cm => (Guid?)cm.Id)
                        .FirstOrDefault(),
                    DoneId = dbContext
                        .CardDones.Where(cd => cd.CardId == c.Id)
                        .Select(cd => (Guid?)cd.Id)
                        .FirstOrDefault(),
                    NotNowId = dbContext
                        .CardNotNows.Where(cn => cn.CardId == c.Id)
                        .Select(cn => (Guid?)cn.Id)
                        .FirstOrDefault(),
                    Assignments = dbContext
                        .CardAssignments.Where(a => a.CardId == c.Id)
                        .Join(
                            dbContext.Members,
                            a => a.AssigneeMemberId,
                            m => m.Id,
                            (a, m) => new GetCardAssignee(m.Id, m.Name)
                        )
                        .ToList(),
                    IsWatching = dbContext.CardWatches.Any(cw =>
                        cw.CardId == c.Id && cw.MemberId == memberId && cw.Watching
                    ),
                    IsGolden = dbContext.CardGoldnesses.Any(g => g.CardId == c.Id),
                    Tags = dbContext
                        .CardTags.Where(ct => ct.CardId == c.Id)
                        .Join(
                            dbContext.Tags,
                            ct => ct.TagId,
                            t => t.Id,
                            (ct, t) => new GetCardTag(t.Id, t.Title, t.Color)
                        )
                        .ToList(),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (card is null)
                return Result.Fail("Card not found.");

            return Result.Ok(
                new GetCardResponse(
                    card.Id,
                    card.No,
                    card.Title,
                    card.Body,
                    card.BoardId,
                    card.ColumnId,
                    card.MaybeId,
                    card.DoneId,
                    card.NotNowId,
                    card.CreatorName ?? string.Empty,
                    card.CreatedAt,
                    card.LastActiveAt,
                    card.AutoClosePeriodDays,
                    card.Assignments,
                    card.IsWatching,
                    card.IsGolden,
                    card.Tags
                )
            );
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/cards/{cardId:guid}",
                    async (Guid teamId, Guid cardId, ClaimsPrincipal user, ISender sender) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        var result = await sender.Send(
                            new GetCardQuery(cardId, teamId, userId.Value)
                        );

                        return result.IsFailed
                            ? Results.NotFound(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(x => x.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<GetCardResponse>(result.Value));
                    }
                )
                .RequireAuthorization();
        }
    }
}
