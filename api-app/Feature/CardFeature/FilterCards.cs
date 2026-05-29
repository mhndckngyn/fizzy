using System.Security.Claims;
using Carter;
using Feature.ApiResponses;
using Feature.Extensions;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeature;

public static class FilterCards
{
    public sealed record AssigneeDto(Guid MemberId, string Name);

    public sealed record TagDto(Guid TagId, string Title, string Color);

    public sealed record CardSummaryDto(
        Guid CardId,
        int No,
        string? Title,
        string Status,
        string? ColumnId,
        string? ColumnName,
        string? ColumnColor,
        Guid BoardId,
        string BoardName,
        List<AssigneeDto> Assignees,
        List<TagDto> Tags,
        DateTime CreatedAt,
        string CreatorName,
        DateTime LastActiveAt,
        int AutoClosePeriodDays,
        DateTime? ClosedAt,
        int CommentsCount
    );

    public sealed record Response(List<CardSummaryDto> Cards, int Total, int Page, int PageSize);

    internal sealed record Query(
        Guid TeamId,
        Guid? BoardId,
        Guid UserId,
        string? Search,
        List<string>? Statuses,
        string SortBy,
        List<Guid>? AssignedToIds,
        bool AssignedToNone,
        List<Guid>? AddedByIds,
        List<Guid>? ClosedByIds,
        List<Guid>? TagIds,
        int Page,
        int PageSize
    ) : IRequest<Result<Response>>;

    internal sealed class Handler(AppDbContext db) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query req, CancellationToken ct)
        {
            bool isMember = await db.Members.AnyAsync(
                m => m.UserId == req.UserId && m.TeamId == req.TeamId,
                ct
            );

            if (!isMember)
                return Result.Fail("You are not a member of this team.");

            Guid memberId = await db
                .Members.Where(m => m.UserId == req.UserId && m.TeamId == req.TeamId)
                .Select(m => m.Id)
                .FirstAsync(ct);

            var accessibleBoardIds = await db
                .Boards.Where(b =>
                    b.TeamId == req.TeamId
                    && (b.AllAccess || b.BoardAccesses.Any(ba => ba.MemberId == memberId))
                )
                .Select(b => b.Id)
                .ToListAsync(ct);

            var query = db
                .Cards.Where(c => c.TeamId == req.TeamId && accessibleBoardIds.Contains(c.BoardId))
                .AsQueryable();

            if (req.BoardId.HasValue)
            {
                if (!accessibleBoardIds.Contains(req.BoardId.Value))
                    return Result.Fail("You do not have access to this board.");

                query = query.Where(c => c.BoardId == req.BoardId.Value);
            }

            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                string term = req.Search.ToLower();
                query = query.Where(c =>
                    (c.Title != null && c.Title.ToLower().Contains(term))
                    || (
                        c.Content != null
                        && c.Content.Body != null
                        && c.Content.Body.ToLower().Contains(term)
                    )
                );
            }

            if (req.Statuses is { Count: > 0 })
            {
                bool wantOpen = req.Statuses.Contains("open");
                bool wantDone = req.Statuses.Contains("done");
                bool wantNotNow = req.Statuses.Contains("not-now");
                bool wantGolden = req.Statuses.Contains("golden");
                bool wantClosingSoon = req.Statuses.Contains("closing-soon");

                var now = DateTime.UtcNow;
                var soonThreshold = now.AddDays(7);

                query = query.Where(c =>
                    (
                        wantOpen
                        && c.Done == null
                        && c.NotNow == null
                        && c.Maybe == null
                        && c.Golden == null
                    )
                    || (wantDone && c.Done != null)
                    || (wantNotNow && c.NotNow != null)
                    || (wantGolden && c.Golden != null)
                    || (
                        wantClosingSoon
                        && c.Done == null
                        && c.NotNow == null
                        && c.Maybe == null
                        && c.LastActiveAt.AddDays(
                            (double)(
                                c.Board.AutoClosePeriodDays ?? c.Board.Team.AutoClosePeriodDays
                            )
                        ) <= soonThreshold
                    )
                );
            }

            if (req.AssignedToNone)
                query = query.Where(c => !c.Assignments.Any());
            else if (req.AssignedToIds is { Count: > 0 })
                query = query.Where(c =>
                    c.Assignments.Any(a => req.AssignedToIds.Contains(a.AssigneeMemberId))
                );

            if (req.AddedByIds is { Count: > 0 })
                query = query.Where(c => req.AddedByIds.Contains(c.CreatorMemberId));

            if (req.ClosedByIds is { Count: > 0 })
                query = query.Where(c =>
                    c.Done != null
                    && c.Done.ClosedByMemberId != null
                    && req.ClosedByIds.Contains(c.Done.ClosedByMemberId.Value)
                );

            if (req.TagIds is { Count: > 0 })
                query = query.Where(c => c.CardTags.Any(ct => req.TagIds.Contains(ct.TagId)));

            query = req.SortBy switch
            {
                "newest" => query.OrderByDescending(c => c.CreatedAt),
                "oldest" => query.OrderBy(c => c.CreatedAt),
                _ => query.OrderByDescending(c => c.LastActiveAt),
            };

            int total = await query.CountAsync(ct);

            var raw = await query
                .Skip((req.Page - 1) * req.PageSize)
                .Take(req.PageSize)
                .Select(c => new
                {
                    c.Id,
                    c.No,
                    c.Title,
                    IsDone = c.Done != null,
                    IsNotNow = c.NotNow != null,
                    IsMaybe = c.Maybe != null,
                    IsGolden = c.Golden != null,
                    c.ColumnId,
                    c.BoardId,
                    BoardName = c.Board.Name,
                    c.CreatedAt,
                    c.LastActiveAt,
                    AutoClosePeriodDays = c.Board.AutoClosePeriodDays
                        ?? c.Board.Team.AutoClosePeriodDays,
                    CreatorName = c.Creator.Name,
                    ClosedAt = c.Done != null ? (DateTime?)c.Done.CreatedAt : null,
                    Assignees = c
                        .Assignments.Select(a => new AssigneeDto(
                            a.AssigneeMemberId,
                            a.Assignee.Name
                        ))
                        .ToList(),
                    Tags = c
                        .CardTags.Select(ct => new TagDto(ct.TagId, ct.Tag.Title, ct.Tag.Color))
                        .ToList(),
                    CommentsCount = c.Comments.Count(),
                })
                .ToListAsync(ct);

            List<Guid> columnIds = raw.Where(r => r.ColumnId.HasValue)
                .Select(r => r.ColumnId!.Value)
                .Distinct()
                .ToList();

            Dictionary<Guid, (string Name, string Color)> columnMap =
                columnIds.Count > 0
                    ? await db
                        .Columns.Where(col => columnIds.Contains(col.Id))
                        .Select(col => new
                        {
                            col.Id,
                            col.Name,
                            col.Color,
                        })
                        .ToDictionaryAsync(c => c.Id, c => (c.Name, c.Color), ct)
                    : [];

            List<CardSummaryDto> cards = raw.Select(r =>
                {
                    string status =
                        r.IsDone ? "done"
                        : r.IsNotNow ? "not-now"
                        : r.IsGolden ? "golden"
                        : "open";

                    string? colName = null;
                    string? colColor = null;
                    if (r.ColumnId.HasValue && columnMap.TryGetValue(r.ColumnId.Value, out var col))
                    {
                        colName = col.Name;
                        colColor = col.Color;
                    }

                    if (colName is null)
                    {
                        colName =
                            r.IsDone ? "Done"
                            : r.IsNotNow ? "Not Now"
                            : r.IsMaybe ? "May be"
                            : null;
                    }

                    return new CardSummaryDto(
                        CardId: r.Id,
                        No: r.No,
                        Title: r.Title,
                        Status: status,
                        ColumnId: r.ColumnId?.ToString(),
                        ColumnName: colName,
                        ColumnColor: colColor,
                        BoardId: r.BoardId,
                        BoardName: r.BoardName,
                        Assignees: r.Assignees,
                        Tags: r.Tags,
                        CreatedAt: r.CreatedAt,
                        CreatorName: r.CreatorName,
                        LastActiveAt: r.LastActiveAt,
                        AutoClosePeriodDays: r.AutoClosePeriodDays,
                        ClosedAt: r.ClosedAt,
                        CommentsCount: r.CommentsCount
                    );
                })
                .ToList();

            return Result.Ok(new Response(cards, total, req.Page, req.PageSize));
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/cards/filter",
                    async (
                        Guid teamId,
                        ClaimsPrincipal user,
                        ISender sender,
                        string? boardId = null,
                        string? search = null,
                        string? statuses = null,
                        string? sortBy = "recently-updated",
                        string? assignedTo = null,
                        string? assignedToNone = null,
                        string? addedBy = null,
                        string? closedBy = null,
                        string? tags = null,
                        int page = 1,
                        int pageSize = 50
                    ) =>
                    {
                        Guid? userId = user.GetUserId();
                        if (userId is null)
                            return Results.Unauthorized();

                        Guid? parsedBoardId = Guid.TryParse(boardId, out var bid) ? bid : null;

                        Query query = new(
                            TeamId: teamId,
                            BoardId: parsedBoardId,
                            UserId: userId.Value,
                            Search: search,
                            Statuses: ParseStrings(statuses),
                            SortBy: sortBy ?? "recently-updated",
                            AssignedToIds: ParseGuids(assignedTo),
                            AssignedToNone: assignedToNone == "true",
                            AddedByIds: ParseGuids(addedBy),
                            ClosedByIds: ParseGuids(closedBy),
                            TagIds: ParseGuids(tags),
                            Page: Math.Max(1, page),
                            PageSize: Math.Clamp(pageSize, 1, 200)
                        );

                        Result<Response> result = await sender.Send(query);

                        return result.IsFailed
                            ? Results.BadRequest(
                                new FailResponse<IEnumerable<string>>(
                                    result.Errors.Select(e => e.Message)
                                )
                            )
                            : Results.Ok(new SuccessResponse<Response>(result.Value));
                    }
                )
                .RequireAuthorization();
        }

        private static List<Guid>? ParseGuids(string? s)
        {
            if (string.IsNullOrWhiteSpace(s))
                return null;
            List<Guid> list = s.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => Guid.TryParse(x.Trim(), out Guid g) ? g : Guid.Empty)
                .Where(g => g != Guid.Empty)
                .ToList();
            return list.Count > 0 ? list : null;
        }

        private static List<string>? ParseStrings(string? s)
        {
            if (string.IsNullOrWhiteSpace(s))
                return null;
            List<string> list = s.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => x.Trim().ToLower())
                .Where(x => !string.IsNullOrEmpty(x))
                .ToList();
            return list.Count > 0 ? list : null;
        }
    }
}
