using System.Text.Json;
using StackExchange.Redis;

namespace Feature.UserFeature;

public class RedisUserCache(
    IConnectionMultiplexer connectionMultiplexer,
    ILogger<RedisUserCache> logger
) : IUserCache
{
    private readonly IDatabase _db = connectionMultiplexer.GetDatabase();

    private static readonly TimeSpan ExpirationTime = TimeSpan.FromMinutes(10);
    private const string Prefix = "fizzy:user";

    private static string Key(Guid userId) => $"{Prefix}:{userId}";

    public async Task<CachedUser?> GetAsync(Guid userId, CancellationToken? cancellationToken)
    {
        try
        {
            string? json = await _db.StringGetAsync(Key(userId));
            return json is null ? null : JsonSerializer.Deserialize<CachedUser>(json);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Redis unavailable; skipping cache read for user {UserId}",
                userId
            );
            return null;
        }
    }

    public async Task<bool> SetAsync(
        Guid userId,
        CachedUser cachedUser,
        CancellationToken? cancellationToken
    )
    {
        try
        {
            await _db.StringSetAsync(
                Key(userId),
                JsonSerializer.Serialize(cachedUser),
                ExpirationTime,
                When.NotExists
            );
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Redis unavailable; skipping cache set for user {UserId}",
                userId
            );
            return false;
        }
    }

    public async Task<bool> DeleteAsync(Guid userId, CancellationToken? cancellationToken)
    {
        try
        {
            await _db.KeyDeleteAsync(Key(userId));
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Redis unavailable; skipping cache delete for user {UserId}",
                userId
            );
            return false;
        }
    }
}
