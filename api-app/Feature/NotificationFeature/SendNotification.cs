using Domain.Entities;
using Feature.Hubs;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Feature.NotificationFeature;

public static class SendNotification
{
    internal sealed record SendNotificationCommand(
        List<Guid> RecipientMemberIds,
        Guid CardId,
        Guid SenderMemberId,
        NotificationType NotificationType
    ) : IRequest<Result>;

    internal sealed record NotificationDto(
        Guid Id,
        string Title,
        string Message,
        string BoardName,
        DateTime CreatedAt,
        string SenderName,
        int CardNo,
        Guid RecipientUserId,
        bool IsRead
    );

    internal sealed class SendNotificationHandler(
        AppDbContext dbContext,
        IHubContext<NotificationHub> hubContext
    ) : IRequestHandler<SendNotificationCommand, Result>
    {
        public async Task<Result> Handle(
            SendNotificationCommand request,
            CancellationToken cancellationToken
        )
        {
            var cardInfo = await dbContext
                .Cards.Where(c => c.Id == request.CardId)
                .Select(c => new
                {
                    c.No,
                    c.Title,
                    BoardName = dbContext
                        .Boards.Where(b => b.Id == c.BoardId)
                        .Select(b => b.Name)
                        .FirstOrDefault(),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (cardInfo is null)
                return Result.Fail("Card not found.");

            var senderName = await dbContext
                .Members.Where(m => m.Id == request.SenderMemberId)
                .Select(m => m.Name)
                .FirstOrDefaultAsync(cancellationToken);

            var recipientUserIds = await dbContext
                .Members.Where(m => request.RecipientMemberIds.Contains(m.Id))
                .Select(m => m.UserId)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (recipientUserIds.Count == 0)
                return Result.Ok();

            var (title, message) = BuildContent(
                request.NotificationType,
                senderName ?? string.Empty,
                cardInfo.Title,
                cardInfo.No
            );

            var notification = new Notification(
                cardInfo.No,
                cardInfo.BoardName ?? string.Empty,
                title,
                message,
                senderName ?? string.Empty,
                request.NotificationType
            );

            foreach (var userId in recipientUserIds)
                notification.AddMember(userId);

            dbContext.Notifications.Add(notification);
            await dbContext.SaveChangesAsync(cancellationToken);

            foreach (var userId in recipientUserIds)
            {
                var dto = new NotificationDto(
                    notification.Id,
                    notification.Title,
                    notification.Message,
                    notification.BoardName,
                    notification.CreatedAt,
                    notification.SenderName,
                    notification.CardNo,
                    userId,
                    IsRead: false
                );

                await hubContext
                    .Clients.Group(userId.ToString())
                    .SendAsync("ReceiveNotification", dto, cancellationToken);
            }

            return Result.Ok();
        }

        private static (string title, string message) BuildContent(
            NotificationType type,
            string senderName,
            string? cardTitle,
            int cardNo
        )
        {
            var cardRef = string.IsNullOrWhiteSpace(cardTitle)
                ? $"#{cardNo}"
                : $"#{cardNo} {cardTitle}";

            return type switch
            {
                NotificationType.Mention => (
                    $"{senderName} mentioned you",
                    $"{senderName} mentioned you in card {cardRef}"
                ),
                NotificationType.Assignment => (
                    $"You were assigned to a card",
                    $"{senderName} assigned you to card {cardRef}"
                ),
                _ => (string.Empty, string.Empty),
            };
        }
    }
}
