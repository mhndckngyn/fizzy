using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

internal class NotificationMemberConfiguration : IEntityTypeConfiguration<NotificationMember>
{
    public void Configure(EntityTypeBuilder<NotificationMember> builder)
    {
        builder.ToTable("Notification_Members");

        builder.HasKey(nm => nm.Id);

        builder.HasIndex(nm => new { nm.RecepientMemberId, nm.NotificationId });

        builder
            .HasOne<Notification>()
            .WithMany(n => n.NotificationMembers)
            .HasForeignKey(nm => nm.NotificationId)
            .OnDelete(DeleteBehavior.Cascade); // When a notification is deleted, its related notification members will also be deleted.

        builder
            .HasOne<User>()
            .WithMany(u => u.NotificationMembers)
            .HasForeignKey(nm => nm.RecepientMemberId)
            .OnDelete(DeleteBehavior.Cascade); // When a user is deleted, their notification members will also be deleted.
    }
}
