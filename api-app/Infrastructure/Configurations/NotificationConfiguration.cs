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

        builder.Property(n => n.CardNo).IsRequired();
        builder.Property(n => n.BoardName).HasMaxLength(255);
        builder.Property(n => n.Title).HasMaxLength(255).IsRequired();
        builder.Property(n => n.Message).HasMaxLength(1000);
        builder.Property(n => n.SenderName).HasMaxLength(255);

        builder.Property(n => n.NotificationType).HasConversion<string>().HasMaxLength(50);
    }
}
