using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardConfiguration : IEntityTypeConfiguration<Card>
{
    public void Configure(EntityTypeBuilder<Card> builder)
    {
        builder.ToTable("Cards");

        builder.HasKey(c => c.Id);

        builder
            .HasOne(c => c.Team)
            .WithMany(t => t.Cards)
            .HasForeignKey(c => c.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Board)
            .WithMany(b => b.Cards)
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Creator)
            .WithMany()
            .HasForeignKey(c => c.CreatorMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        // No unique per team (via Board → TeamId)
        // Đảm bảo No không bị trùng trong cùng 1 team
        builder.HasIndex(c => new { c.BoardId, c.No });

        builder.HasIndex(c => c.BoardId);
        builder.HasIndex(c => c.CreatorMemberId);
    }
}
