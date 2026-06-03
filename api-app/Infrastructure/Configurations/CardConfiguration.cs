using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardConfiguration : IEntityTypeConfiguration<Card>
{
    public void Configure(EntityTypeBuilder<Card> builder)
    {
        builder.ToTable("Cards");

        builder.HasKey(c => c.Id);

        builder
            .HasOne(c => c.Team)
            .WithMany(t => t.Cards)
            .HasForeignKey(c => c.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Board)
            .WithMany(b => b.Cards)
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Creator)
            .WithMany()
            .HasForeignKey(c => c.CreatorMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        // No unique per team (via Board → TeamId)
        // Đảm bảo No không bị trùng trong cùng 1 team
        builder.HasIndex(c => new { c.BoardId, c.No });

        // TODO
        /*
         *  1. The index doesn't enforce uniqueness — HasIndex(c => new { c.BoardId, c.No }) is just a performance index. It needs .IsUnique() to enforce uniqueness at
           the DB level.

           2. But the index is on the wrong columns anyway — No is meant to be unique per team, not per board. The CardsCount on Team is used as the sequence counter
           (atomically incremented in CreateCard.cs), so No is already team-scoped by design. The unique constraint should be on (TeamId, No).

           The current index on (BoardId, No) would also be wrong even if it were unique — two cards on different boards in the same team could get the same No, which
           would pass that constraint but violate your intent.

           To fix both issues, update CardConfiguration.cs:

           // Change this:
           builder.HasIndex(c => new { c.BoardId, c.No });

           // To this:
           builder.HasIndex(c => new { c.TeamId, c.No }).IsUnique();
         *
         */

        builder.HasIndex(c => c.BoardId);
        builder.HasIndex(c => c.CreatorMemberId);
    }
}
