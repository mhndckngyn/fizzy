using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardContentConfiguration : IEntityTypeConfiguration<CardContent>
{
    public void Configure(EntityTypeBuilder<CardContent> builder)
    {
        builder.ToTable("CardContents");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Body).HasColumnType("text");

        builder
            .HasOne(c => c.Card)
            .WithOne(c => c.Content)
            .HasForeignKey<CardContent>(c => c.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.CardId).IsUnique();
    }
}
