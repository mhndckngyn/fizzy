using Domain.Entities;
using Domain.ValueObjects;
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

        builder
            .Property(t => t.InvitationCode)
            .HasConversion(
                code => code == null ? null : code.Value, // Lưu databse
                value => value == null ? null : InvitationCode.Parse(value).Value // Đọc từ dattabase
            )
            .HasMaxLength(14);

        builder.HasIndex(t => t.InvitationCode).IsUnique();

        builder.Property(t => t.AutoClosePeriodDays).HasDefaultValue(30);
    }
}
