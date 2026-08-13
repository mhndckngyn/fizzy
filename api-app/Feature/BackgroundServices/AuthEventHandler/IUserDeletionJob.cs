namespace Feature.BackgroundServices.AuthEventHandler;

public interface IUserDeletionJob
{
    Task DeleteAsync(Guid userId);
}
