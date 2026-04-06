using Domain.Entities;
using FluentResults;
using Infrastructure.Database;
using MediatR;

namespace Feature.CardFeatures;

public static class CreateCardContent
{
    internal sealed record CreateCardContentCommand(Guid CardId, string? Body) : IRequest<Result>;

    internal class CreateCardContentHandler(AppDbContext dbContext)
        : IRequestHandler<CreateCardContentCommand, Result>
    {
        public async Task<Result> Handle(
            CreateCardContentCommand request,
            CancellationToken cancellationToken
        )
        {
            CardContent content = new() { CardId = request.CardId, Body = request.Body };

            dbContext.CardContents.Add(content);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }
}
