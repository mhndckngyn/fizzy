using Domain.Entities;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.UserFeature;

public static class CreateUser
{
    internal sealed record CreateUserCommand(Guid Id, string EmailAddress)
        : IRequest<Result<CreateUserResponse>>;

    internal sealed record CreateUserResponse(Guid Id);

    internal class CreateUserHandler(AppDbContext dbContext)
        : IRequestHandler<CreateUserCommand, Result<CreateUserResponse>>
    {
        public async Task<Result<CreateUserResponse>> Handle(
            CreateUserCommand request,
            CancellationToken cancellationToken
        )
        {
            User? existingUser = await dbContext.Users.FirstOrDefaultAsync(
                u => u.Id == request.Id,
                cancellationToken
            );

            if (existingUser != null)
            {
                return Result.Ok(new CreateUserResponse(existingUser.Id));
            }

            User user = new() { Id = request.Id, EmailAddress = request.EmailAddress };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(new CreateUserResponse(user.Id));
        }
    }
}
