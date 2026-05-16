using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tags");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title).IsRequired().HasMaxLength(100);

        builder.Property(t => t.Color).IsRequired().HasMaxLength(20).HasDefaultValue("#6b7280");

        builder
            .HasOne(t => t.Team)
            .WithMany()
            .HasForeignKey(t => t.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.TeamId, t.Title }).IsUnique();
    }
}
