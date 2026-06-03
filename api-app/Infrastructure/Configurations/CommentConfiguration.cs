using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Body).IsRequired().HasColumnType("text");

        builder
            .HasOne(c => c.Card)
            .WithMany(card => card.Comments)
            .HasForeignKey(c => c.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Creator)
            .WithMany()
            .HasForeignKey(c => c.CreatorMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.CardId);
        builder.HasIndex(c => c.CreatorMemberId);
    }
}
