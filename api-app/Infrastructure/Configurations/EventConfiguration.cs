using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");

        builder.HasKey(e => e.Id);

        builder
            .HasOne(e => e.CreatorMember)
            .WithMany(m => m.Events)
            .HasForeignKey(e => e.CreatorMemberId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Team).WithMany(t => t.Events).HasForeignKey(e => e.TeamId);

        builder.HasOne(e => e.Card).WithMany(c => c.Events).HasForeignKey(e => e.CardId);

        builder.Property(e => e.AppEventType).HasConversion<string>().HasMaxLength(50);

        builder.Property(e => e.Metadata).IsRequired().HasDefaultValue("{}");

        builder.HasIndex(e => new { e.TeamId, e.CreatedAt });
    }
}
