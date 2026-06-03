using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardGoldenConfiguration : IEntityTypeConfiguration<CardGolden>
{
    public void Configure(EntityTypeBuilder<CardGolden> builder)
    {
        builder.ToTable("CardGoldnesses");
        builder.HasKey(g => g.Id);
        builder
            .HasOne(g => g.Card)
            .WithOne(c => c.Golden)
            .HasForeignKey<CardGolden>(g => g.CardId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(g => g.CardId).IsUnique();
        builder.HasIndex(g => g.TeamId);
    }
}
