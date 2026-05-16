using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardTagConfiguration : IEntityTypeConfiguration<CardTag>
{
    public void Configure(EntityTypeBuilder<CardTag> builder)
    {
        builder.ToTable("CardTags");

        builder.HasKey(ct => ct.Id);

        builder
            .HasOne(ct => ct.Card)
            .WithMany(c => c.CardTags)
            .HasForeignKey(ct => ct.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(ct => ct.Tag)
            .WithMany(t => t.CardTags)
            .HasForeignKey(ct => ct.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(ct => ct.AddedBy)
            .WithMany()
            .HasForeignKey(ct => ct.AddedByMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(ct => new { ct.CardId, ct.TagId }).IsUnique();
    }
}
