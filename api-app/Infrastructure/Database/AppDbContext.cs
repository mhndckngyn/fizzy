using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationMember> NotificationMembers => Set<NotificationMember>();

    public DbSet<Team> Teams => Set<Team>();

    public DbSet<Member> Members => Set<Member>();

    public DbSet<Board> Boards => Set<Board>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<CardNotNow> CardNotNows => Set<CardNotNow>();
    public DbSet<CardMaybe> CardMaybes => Set<CardMaybe>();
    public DbSet<CardDone> CardDones => Set<CardDone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
