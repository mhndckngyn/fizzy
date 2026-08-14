using Feature.UserFeature;
using MediatR;

namespace Feature.BackgroundServices.AuthEventHandler;

public class UserDeletionJob(ISender sender, IUserCache userCache) : IUserDeletionJob
{
    public async Task DeleteAsync(Guid userId)
    {
        await sender.Send(new DeleteUser.DeleteUserCommand(userId));
        await userCache.DeleteAsync(userId, CancellationToken.None);
    }
}
