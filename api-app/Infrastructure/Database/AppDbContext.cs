using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Column> Columns => Set<Column>();
    public DbSet<Team> Teams => Set<Team>();

    public DbSet<Member> Members => Set<Member>();

    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardAccess> BoardAccesses => Set<BoardAccess>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<CardNotNow> CardNotNows => Set<CardNotNow>();
    public DbSet<CardMaybe> CardMaybes => Set<CardMaybe>();
    public DbSet<CardDone> CardDones => Set<CardDone>();
    public DbSet<CardContent> CardContents => Set<CardContent>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CardAssignment> CardAssignments => Set<CardAssignment>();
    public DbSet<Pin> Pins { get; set; }
    public DbSet<CardWatch> CardWatches => Set<CardWatch>();
    public DbSet<Event> Events => Set<Event>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
