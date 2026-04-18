using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class ColumnConfiguration : IEntityTypeConfiguration<Column>
{
    public void Configure(EntityTypeBuilder<Column> builder)
    {
        builder.ToTable("Columns");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name).IsRequired().HasMaxLength(255);

        builder.Property(c => c.Color).IsRequired().HasMaxLength(50);

        builder.Property(c => c.Position).IsRequired();

        builder
            .HasOne<Board>()
            .WithMany()
            .HasForeignKey(c => c.BoardId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(c => c.Cards)
            .WithOne()
            .HasForeignKey(card => card.ColumnId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
