using Domain.Entities;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.UserFeature;

public static class GetUser
{
    internal sealed record GetUserCommand(Guid UserId) : IRequest<Result<User?>>;

    internal class GetUserHandler(AppDbContext dbContext)
        : IRequestHandler<GetUserCommand, Result<User?>>
    {
        public async Task<Result<User?>> Handle(
            GetUserCommand request,
            CancellationToken cancellationToken
        )
        {
            User? user = await dbContext
                .Users.Where(u => u.Id == request.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            return user;
        }
    }
}
