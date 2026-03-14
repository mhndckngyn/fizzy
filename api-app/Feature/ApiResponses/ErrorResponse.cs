namespace Feature.ApiResponses;

public sealed record ErrorResponse(string Message)
{
    public string Status => "error";
}
