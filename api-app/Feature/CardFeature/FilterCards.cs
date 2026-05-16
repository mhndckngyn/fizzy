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
    // ── DTOs ─────────────────────────────────────────────────────────────────

    public sealed record AssigneeDto(Guid MemberId, string Name);

    public sealed record TagDto(Guid TagId, string Title, string Color);

    public sealed record CardSummaryDto(
        Guid CardId,
        int No,
        string? Title,
        string Status, // "open" | "done" | "not-now" | "maybe"
        string? ColumnId,
        string? ColumnName,
        string? ColumnColor,
        List<AssigneeDto> Assignees,
        List<TagDto> Tags,
        DateTime CreatedAt,
        string CreatorName,
        DateTime? UpdatedAt,
        DateTime? ClosedAt
    );

    public sealed record Response(List<CardSummaryDto> Cards, int Total, int Page, int PageSize);

    // ── Query ─────────────────────────────────────────────────────────────────

    internal sealed record Query(
        Guid TeamId,
        Guid BoardId,
        Guid UserId,
        string? Search,
        List<string>? Statuses, // "open" | "done" | "not-now" | "maybe"
        string SortBy, // "recently-updated" | "newest" | "oldest"
        List<Guid>? AssignedToIds,
        List<Guid>? AddedByIds,
        List<Guid>? ClosedByIds,
        List<Guid>? TagIds,
        int Page,
        int PageSize
    ) : IRequest<Result<Response>>;

    // ── Handler ───────────────────────────────────────────────────────────────

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

            var query = db
                .Cards.Where(c => c.BoardId == req.BoardId && c.TeamId == req.TeamId)
                .AsQueryable();

            // ── Text search ───────────────────────────────────────────────────
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

            // ── Status filter ─────────────────────────────────────────────────
            if (req.Statuses is { Count: > 0 })
            {
                bool wantOpen = req.Statuses.Contains("open");
                bool wantDone = req.Statuses.Contains("done");
                bool wantNotNow = req.Statuses.Contains("not-now");
                bool wantMaybe = req.Statuses.Contains("maybe");

                query = query.Where(c =>
                    (wantOpen && c.Done == null && c.NotNow == null && c.Maybe == null)
                    || (wantDone && c.Done != null)
                    || (wantNotNow && c.NotNow != null)
                    || (wantMaybe && c.Maybe != null)
                );
            }

            // ── Assigned-to filter ────────────────────────────────────────────
            if (req.AssignedToIds is { Count: > 0 })
            {
                query = query.Where(c =>
                    c.Assignments.Any(a => req.AssignedToIds.Contains(a.AssigneeMemberId))
                );
            }

            // ── Added-by filter ───────────────────────────────────────────────
            if (req.AddedByIds is { Count: > 0 })
            {
                query = query.Where(c => req.AddedByIds.Contains(c.CreatorMemberId));
            }

            // ── Closed-by filter ──────────────────────────────────────────────
            if (req.ClosedByIds is { Count: > 0 })
            {
                query = query.Where(c =>
                    c.Done != null
                    && c.Done.ClosedByMemberId != null
                    && req.ClosedByIds.Contains(c.Done.ClosedByMemberId.Value)
                );
            }

            // ── Tag filter ────────────────────────────────────────────────────
            if (req.TagIds is { Count: > 0 })
            {
                query = query.Where(c => c.CardTags.Any(ct => req.TagIds.Contains(ct.TagId)));
            }

            // ── Sorting ───────────────────────────────────────────────────────
            query = req.SortBy switch
            {
                "newest" => query.OrderByDescending(c => c.CreatedAt),
                "oldest" => query.OrderBy(c => c.CreatedAt),
                _ => query.OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt),
            };

            // ── Count + paginate ──────────────────────────────────────────────
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
                    c.ColumnId,
                    c.CreatedAt,
                    c.UpdatedAt,
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
                })
                .ToListAsync(ct);

            // ── Resolve column name + color ───────────────────────────────────
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
                        : r.IsMaybe ? "maybe"
                        : "open";

                    string? colName = null;
                    string? colColor = null;
                    if (r.ColumnId.HasValue && columnMap.TryGetValue(r.ColumnId.Value, out var col))
                    {
                        colName = col.Name;
                        colColor = col.Color;
                    }

                    return new CardSummaryDto(
                        CardId: r.Id,
                        No: r.No,
                        Title: r.Title,
                        Status: status,
                        ColumnId: r.ColumnId?.ToString(),
                        ColumnName: colName,
                        ColumnColor: colColor,
                        Assignees: r.Assignees,
                        Tags: r.Tags,
                        CreatedAt: r.CreatedAt,
                        CreatorName: r.CreatorName,
                        UpdatedAt: r.UpdatedAt,
                        ClosedAt: r.ClosedAt
                    );
                })
                .ToList();

            return Result.Ok(new Response(cards, total, req.Page, req.PageSize));
        }
    }

    // ── Endpoint ──────────────────────────────────────────────────────────────

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/teams/{teamId:guid}/boards/{boardId:guid}/cards",
                    async (
                        Guid teamId,
                        Guid boardId,
                        ClaimsPrincipal user,
                        ISender sender,
                        string? search = null,
                        string? statuses = null,
                        string? sortBy = "recently-updated",
                        string? assignedTo = null,
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

                        Query query = new(
                            TeamId: teamId,
                            BoardId: boardId,
                            UserId: userId.Value,
                            Search: search,
                            Statuses: ParseStrings(statuses),
                            SortBy: sortBy ?? "recently-updated",
                            AssignedToIds: ParseGuids(assignedTo),
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
