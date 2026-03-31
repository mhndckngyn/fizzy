using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardNotNowConfiguration : IEntityTypeConfiguration<CardNotNow>
{
    public void Configure(EntityTypeBuilder<CardNotNow> builder)
    {
        builder.ToTable("CardNotNows");

        builder.HasKey(c => c.Id);

        builder
            .HasOne(c => c.Card)
            .WithOne(c => c.NotNow)
            .HasForeignKey<CardNotNow>(c => c.CardId)
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
