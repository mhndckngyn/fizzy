using Domain.Entities;
using Domain.Enums;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature.NotificationStrategies;

public class CommentStrategy(AppDbContext dbContext) : INotificationStrategy
{
    public List<AppEvent> CanHandle { get; } = [AppEvent.CommentCreate];

    public async Task<List<Guid>> GetMemberIdsToNotify(Event evnt)
    {
        return await dbContext
            .CardWatches.AsNoTracking()
            .Where(watch =>
                watch.CardId == evnt.CardId
                && watch.Watching == true
                && watch.MemberId != evnt.CreatorMemberId
            )
            .Select(watch => watch.MemberId)
            .ToListAsync();
    }
}
