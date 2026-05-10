using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardDoneConfiguration : IEntityTypeConfiguration<CardDone>
{
    public void Configure(EntityTypeBuilder<CardDone> builder)
    {
        builder.ToTable("CardDones");

        builder.HasKey(c => c.Id);

        builder
            .HasOne(c => c.Card)
            .WithOne(c => c.Done)
            .HasForeignKey<CardDone>(c => c.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Board)
            .WithMany()
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(c => c.ClosedByMember)
            .WithMany()
            .HasForeignKey(c => c.ClosedByMemberId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(c => c.CardId).IsUnique();
        builder.HasIndex(c => c.BoardId);
    }
}
