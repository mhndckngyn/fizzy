namespace Feature.UserFeature;

public interface IUserCache
{
    Task<CachedUser?> GetAsync(Guid userId, CancellationToken? cancellationToken);

    Task<bool> SetAsync(Guid userId, CachedUser cachedUser, CancellationToken? cancellationToken);

    Task<bool> DeleteAsync(Guid userId, CancellationToken? cancellationToken);
}

public record CachedUser(DateTime? DeletedAt);
