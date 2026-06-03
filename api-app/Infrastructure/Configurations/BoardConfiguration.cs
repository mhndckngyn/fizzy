using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class BoardConfiguration : IEntityTypeConfiguration<Board>
{
    public void Configure(EntityTypeBuilder<Board> builder)
    {
        builder.ToTable("Boards");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name).IsRequired();

        builder.Property(b => b.AllAccess).HasDefaultValue(false);

        builder
            .HasOne(b => b.Team)
            .WithMany(t => t.Boards)
            .HasForeignKey(b => b.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(b => b.Creator)
            .WithMany()
            .HasForeignKey(b => b.CreatorMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(b => b.TeamId);
        builder.HasIndex(b => b.CreatorMemberId);
    }
}
