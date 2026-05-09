using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

internal class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.UnreadCount).IsRequired();
        builder.Property(n => n.ReadAt);
        builder.Property(n => n.UpdatedAt).IsRequired();
        builder.Property(n => n.RecipientMemberId).IsRequired();

        builder.HasIndex(n => new { n.CardId, n.RecipientMemberId });

        builder
            .HasOne(n => n.Team)
            .WithMany()
            .HasForeignKey(n => n.TeamId)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(n => n.Card)
            .WithMany()
            .HasForeignKey(n => n.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(n => n.Event)
            .WithMany()
            .HasForeignKey(n => n.EventId)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(n => n.RecipientMember)
            .WithMany()
            .HasForeignKey(n => n.RecipientMemberId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
