using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.ToTable("Teams");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.ExternalTeamId).UseIdentityColumn();

        builder.HasIndex(t => t.ExternalTeamId).IsUnique();

        builder.Property(t => t.InvitationId).HasMaxLength(14).IsRequired(false);

        builder.HasIndex(t => t.InvitationId).IsUnique();
    }
}
