using Domain.Entities;
using FluentResults;
using Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Feature.CardFeatures;

public static class UpdateCardContent
{
    internal sealed record UpdateCardContentCommand(Guid CardId, string? Body) : IRequest<Result>;

    internal class UpdateCardContentHandler(AppDbContext dbContext)
        : IRequestHandler<UpdateCardContentCommand, Result>
    {
        public async Task<Result> Handle(
            UpdateCardContentCommand request,
            CancellationToken cancellationToken
        )
        {
            CardContent? content = await dbContext.CardContents.FirstOrDefaultAsync(
                c => c.CardId == request.CardId,
                cancellationToken
            );

            if (content is null)
            {
                dbContext.CardContents.Add(new() { CardId = request.CardId, Body = request.Body });
            }
            else
            {
                content.Body = request.Body;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }
}
