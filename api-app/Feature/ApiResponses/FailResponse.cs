namespace Feature.ApiResponses;

public sealed record FailResponse<T>(T? Data)
{
    public string Status = "fail";
}
