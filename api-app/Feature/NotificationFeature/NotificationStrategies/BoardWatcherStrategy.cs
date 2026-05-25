using Domain.Entities;
using Domain.Enums;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature.NotificationStrategies;

public class BoardWatcherStrategy(AppDbContext appDbContext) : INotificationStrategy
{
    public List<AppEvent> CanHandle { get; } =
    [
        AppEvent.CardUnassign,
        AppEvent.CardCreate,
        AppEvent.CardDone,
        AppEvent.CardToMaybe,
        AppEvent.CardBoardChange,
        AppEvent.CardReopened,
        AppEvent.CardPostponed,
        AppEvent.CardResumed,
        AppEvent.CardColumnChange,
        AppEvent.CardTitleChanged,
        AppEvent.CardAutoPostponed,
    ];

    public async Task<List<Guid>> GetMemberIdsToNotify(Event evnt)
    {
        Guid? creatorId = evnt.CreatorMemberId;
        return await appDbContext
            .BoardAccesses.AsNoTracking()
            .Where(access =>
                access.TeamId == evnt.TeamId && (creatorId == null || access.MemberId != creatorId)
            )
            .Where(access => access.BoardInvolvement == BoardInvolvement.Watching)
            .Select(access => access.MemberId)
            .ToListAsync();
    }
}
