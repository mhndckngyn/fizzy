using Domain.Entities;
using Domain.Enums;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Feature.AutoCloseFeature;

public interface IAutoCloseJob
{
    Task RunAsync();
}

public class AutoCloseJob(AppDbContext dbContext, ILogger<AutoCloseJob> logger) : IAutoCloseJob
{
    public async Task RunAsync()
    {
        var now = DateTime.UtcNow;

        // Find all active cards (not Done, not already NotNow) whose entropy clock has expired.
        // "Effective period" = board override if set, otherwise team default.
        // We express the condition as: LastActiveAt + effectivePeriodDays < now
        // so that Npgsql can translate AddDays(column) to PostgreSQL interval arithmetic.
        var overdueCards = await dbContext
            .Cards.Where(c =>
                !dbContext.CardNotNows.Any(n => n.CardId == c.Id)
                && !dbContext.CardDones.Any(d => d.CardId == c.Id)
                && c.LastActiveAt.AddDays(
                    c.Board.AutoClosePeriodDays ?? c.Board.Team.AutoClosePeriodDays
                ) < now
            )
            .Select(c => new
            {
                c.Id,
                c.TeamId,
                c.BoardId,
            })
            .ToListAsync();

        if (overdueCards.Count == 0)
            return;

        logger.LogInformation(
            "AutoCloseJob: auto-postponing {Count} overdue card(s).",
            overdueCards.Count
        );

        var cardIds = overdueCards.Select(c => c.Id).ToList();

        // Clear any existing Maybe state (Done/NotNow already excluded by the query above)
        await dbContext.CardMaybes.Where(m => cardIds.Contains(m.CardId)).ExecuteDeleteAsync();

        // Clear ColumnId and touch LastActiveAt (marks the auto-postpone itself as activity)
        await dbContext
            .Cards.Where(c => cardIds.Contains(c.Id))
            .ExecuteUpdateAsync(s =>
                s.SetProperty(c => c.ColumnId, (Guid?)null).SetProperty(c => c.LastActiveAt, now)
            );

        // Insert CardNotNow + Event records
        foreach (var card in overdueCards)
        {
            dbContext.CardNotNows.Add(new CardNotNow { CardId = card.Id, BoardId = card.BoardId });

            dbContext.Events.Add(
                new Event(
                    appEventType: AppEvent.CardAutoPostponed,
                    teamId: card.TeamId,
                    creatorMemberId: null,
                    cardId: card.Id
                )
            );
        }

        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "AutoCloseJob: successfully postponed {Count} card(s).",
            overdueCards.Count
        );
    }
}
