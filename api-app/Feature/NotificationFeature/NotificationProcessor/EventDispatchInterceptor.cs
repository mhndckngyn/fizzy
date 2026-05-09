using System.Runtime.CompilerServices;
using Domain.Entities;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Feature.NotificationFeature.NotificationProcessor;

public class EventDispatchInterceptor(IBackgroundJobClient backgroundJobs) : SaveChangesInterceptor
{
    private readonly ConditionalWeakTable<DbContext, List<Guid>> _pending = new();

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default
    )
    {
        if (eventData.Context is not null)
        {
            var ids = _pending.GetOrCreateValue(eventData.Context);
            ids.AddRange(
                eventData
                    .Context.ChangeTracker.Entries<Event>()
                    .Where(e => e.State == EntityState.Added)
                    .Select(e => e.Entity.Id)
            );
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default
    )
    {
        if (eventData.Context is not null && _pending.TryGetValue(eventData.Context, out var ids))
        {
            foreach (var id in ids)
                backgroundJobs.Enqueue<IEventProcessor>(p => p.ProcessEventJob(id));

            ids.Clear();
        }

        return base.SavedChangesAsync(eventData, result, cancellationToken);
    }
}
