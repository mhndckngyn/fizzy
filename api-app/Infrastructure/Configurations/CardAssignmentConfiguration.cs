using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class CardAssignmentConfiguration : IEntityTypeConfiguration<CardAssignment>
{
    public void Configure(EntityTypeBuilder<CardAssignment> builder)
    {
        builder.ToTable("CardAssignments");

        builder.HasKey(a => a.Id);

        builder
            .HasOne(a => a.Card)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(a => a.Board)
            .WithMany()
            .HasForeignKey(a => a.BoardId)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(a => a.Assignee)
            .WithMany()
            .HasForeignKey(a => a.AssigneeMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(a => a.Assigner)
            .WithMany()
            .HasForeignKey(a => a.AssignerMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        // Mỗi member chỉ được assign 1 lần vào 1 card
        builder.HasIndex(a => new { a.CardId, a.AssigneeMemberId }).IsUnique();

        builder.HasIndex(a => a.BoardId);
        builder.HasIndex(a => a.AssigneeMemberId);
        builder.HasIndex(a => a.AssignerMemberId);
    }
}
