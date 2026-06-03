namespace Feature.ApiResponses;

public sealed record SuccessResponse<T>(T? Data)
{
    public string Status => "success";
}
