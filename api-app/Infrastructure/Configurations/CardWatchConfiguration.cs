using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

internal class CardWatchConfiguration : IEntityTypeConfiguration<CardWatch>
{
    public void Configure(EntityTypeBuilder<CardWatch> builder)
    {
        builder.ToTable("CardWatches");

        builder.HasKey(cw => cw.Id);

        builder.HasIndex(cw => new { cw.CardId, cw.MemberId }).IsUnique();

        builder
            .HasOne(cw => cw.Team)
            .WithMany()
            .HasForeignKey(cw => cw.TeamId)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(cw => cw.Card)
            .WithMany(c => c.CardWatches)
            .HasForeignKey(cw => cw.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(cw => cw.Member)
            .WithMany()
            .HasForeignKey(cw => cw.MemberId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
