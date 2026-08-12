using Domain.Entities;
using Feature.TeamFeatures;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.UserFeature;

public static class DeleteUser
{
    internal sealed record DeleteUserCommand(Guid UserId) : IRequest<Result>;

    internal class DeleteUserHandler(AppDbContext dbContext, ISender sender)
        : IRequestHandler<DeleteUserCommand, Result>
    {
        public async Task<Result> Handle(
            DeleteUserCommand request,
            CancellationToken cancellationToken
        )
        {
            var user = await dbContext
                .Users.Where(u => u.Id == request.UserId && u.DeletedAt == null)
                .Include(u => u.Members)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                return Result.Ok();
            }

            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                cancellationToken
            );

            foreach (var member in user.Members)
            {
                var command = new ClearMemberData.ClearMemberDataCommand(member);
                await sender.Send(command, cancellationToken);
            }

            user.DeletedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result.Ok();
        }
    }
}
