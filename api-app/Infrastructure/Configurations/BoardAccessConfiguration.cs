using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

internal class BoardAccessConfiguration : IEntityTypeConfiguration<BoardAccess>
{
    public void Configure(EntityTypeBuilder<BoardAccess> builder)
    {
        builder.ToTable("BoardAccesses");

        builder.HasKey(ba => new { ba.BoardId, ba.MemberId });

        builder
            .Property(ba => ba.BoardInvolvement)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder
            .HasOne(ba => ba.Team)
            .WithMany()
            .HasForeignKey(ba => ba.TeamId)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(ba => ba.Board)
            .WithMany(b => b.BoardAccesses)
            .HasForeignKey(ba => ba.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(ba => ba.Member)
            .WithMany()
            .HasForeignKey(ba => ba.MemberId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
