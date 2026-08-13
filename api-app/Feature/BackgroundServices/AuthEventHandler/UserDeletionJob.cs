using Feature.UserFeature;
using MediatR;

namespace Feature.BackgroundServices.AuthEventHandler;

public class UserDeletionJob(ISender sender) : IUserDeletionJob
{
    public async Task DeleteAsync(Guid userId)
    {
        var command = new DeleteUser.DeleteUserCommand(userId);
        await sender.Send(command);
    }
}
