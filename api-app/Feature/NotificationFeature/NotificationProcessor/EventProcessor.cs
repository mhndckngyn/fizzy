using Domain.Entities;
using Feature.Hubs;
using Feature.NotificationFeature.NotificationStrategies;
using Infrastructure.Database;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature.NotificationProcessor;

public class EventProcessor(
    IEnumerable<INotificationStrategy> strategies,
    AppDbContext dbContext,
    IHubContext<NotificationHub> hubContext
) : IEventProcessor
{
    public async Task ProcessEventJob(Guid eventId)
    {
        // 1. Load Event with necessary data for mapping later
        Event? evnt = await dbContext
            .Events.Include(e => e.Card)
                .ThenInclude(c => c.Board)
            .Include(e => e.CreatorMember)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (evnt == null)
            return;

        INotificationStrategy? strategy = strategies.FirstOrDefault(s =>
            s.CanHandle.Contains(evnt.AppEventType)
        );
        if (strategy == null)
            return;

        List<Guid> notifiedMemberIds = await strategy.GetMemberIdsToNotify(evnt);

        // 1. Fetch all existing notifications and members in one go
        var existingNotifications = await dbContext
            .Notifications.Where(n =>
                n.CardId == evnt.CardId && notifiedMemberIds.Contains(n.RecipientMemberId)
            )
            .ToListAsync();

        var members = await dbContext
            .Members.Where(m => notifiedMemberIds.Contains(m.Id))
            .ToListAsync();

        var notificationsToBroadcast = new List<(Notification Notif, Guid UserId)>();

        // 2. Process logic in memory
        foreach (Member member in members)
        {
            Notification? notification = existingNotifications.FirstOrDefault(n =>
                n.RecipientMemberId == member.Id
            );

            if (notification != null)
            {
                notification.EventId = evnt.Id;
                notification.UnreadCount += 1;
                notification.ReadAt = null;
                notification.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                notification = new Notification(evnt.TeamId, evnt.CardId, evnt.Id, member.Id);
                dbContext.Notifications.Add(notification);
            }

            // Link navigation properties in memory so the Mapper works without extra DB calls
            notification.Event = evnt;
            notification.RecipientMember = member;

            notificationsToBroadcast.Add((notification, member.UserId));
        }

        // 3. Save everything in a single transaction
        await dbContext.SaveChangesAsync();

        // 4. Broadcast via SignalR after the DB is confirmed
        IEnumerable<Task> broadcastTasks = notificationsToBroadcast.Select(item =>
        {
            NotificationMapper.NotificationDto dto = NotificationMapper.MapToDto(item.Notif);
            return hubContext
                .Clients.Group(item.UserId.ToString())
                .SendAsync("ReceiveNotification", dto);
        });

        await Task.WhenAll(broadcastTasks);
    }
}
