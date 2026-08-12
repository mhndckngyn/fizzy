using Domain.Entities;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class ClearMemberData
{
    internal sealed record ClearMemberDataCommand(Member Member) : IRequest<Result>;

    internal class ClearMemberDataHandler(AppDbContext dbContext)
        : IRequestHandler<ClearMemberDataCommand, Result>
    {
        public async Task<Result> Handle(
            ClearMemberDataCommand request,
            CancellationToken cancellationToken
        )
        {
            await dbContext
                .Pins.Where(p => p.MemberId == request.Member.Id)
                .ExecuteDeleteAsync(cancellationToken);

            await dbContext
                .Notifications.Where(n => n.RecipientMemberId == request.Member.Id)
                .ExecuteDeleteAsync(cancellationToken);

            await dbContext
                .CardWatches.Where(cw => cw.MemberId == request.Member.Id)
                .ExecuteDeleteAsync(cancellationToken);

            await dbContext
                .BoardAccesses.Where(ba => ba.MemberId == request.Member.Id)
                .ExecuteDeleteAsync(cancellationToken);

            request.Member.RemovedAt = DateTime.UtcNow;
            request.Member.UserId = null;

            return Result.Ok();
        }
    }
}
