using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class PinConfiguration : IEntityTypeConfiguration<Pin>
{
    public void Configure(EntityTypeBuilder<Pin> builder)
    {
        builder.ToTable("Pins");
        builder.HasKey(p => p.Id);

        builder
            .HasOne(p => p.Card)
            .WithMany()
            .HasForeignKey(p => p.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(p => p.Member)
            .WithMany()
            .HasForeignKey(p => p.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(p => p.Team)
            .WithMany()
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.NoAction);

        // Mỗi member chỉ pin 1 card 1 lần
        builder.HasIndex(p => new { p.CardId, p.MemberId }).IsUnique();
        builder.HasIndex(p => p.MemberId);
        builder.HasIndex(p => p.TeamId);
    }
}
