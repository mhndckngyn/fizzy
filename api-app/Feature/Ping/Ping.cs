using Carter;
using MediatR;

namespace Feature.Ping;

public static class Ping
{
    internal sealed record PingQuery() : IRequest<string>;

    internal sealed class PingHandler : IRequestHandler<PingQuery, string>
    {
        public Task<string> Handle(PingQuery request, CancellationToken cancellationToken)
        {
            return Task.FromResult("Pong!");
        }
    }

    public class Endpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                "api/ping",
                async (ISender sender) =>
                {
                    var query = new PingQuery();
                    var result = await sender.Send(query);

                    return Results.Ok(new { message = result, serverTime = DateTime.UtcNow });
                }
            );
        }
    }
}
