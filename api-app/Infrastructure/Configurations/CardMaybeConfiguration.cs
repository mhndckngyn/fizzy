using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardMaybeConfiguration : IEntityTypeConfiguration<CardMaybe>
{
    public void Configure(EntityTypeBuilder<CardMaybe> builder)
    {
        builder.ToTable("CardMaybes");

        builder.HasKey(c => c.Id);

        builder
            .HasOne(c => c.Card)
            .WithOne(c => c.Maybe)
            .HasForeignKey<CardMaybe>(c => c.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Board)
            .WithMany()
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(c => c.CardId).IsUnique();
        builder.HasIndex(c => c.BoardId);
    }
}
