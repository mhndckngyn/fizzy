using Feature.ApiResponses;
using FluentResults;

namespace Feature.Extensions;

public static class ResultExtensions
{
    public static IResult ToMinimalApiResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Results.Ok(new SuccessResponse<T>(result.Value));
        }

        return HandleFailure(result);
    }

    public static IResult ToCreatedMinimalApiResult<T>(
        this Result<T> result,
        Func<T, string> uriProvider
    )
    {
        if (result.IsSuccess)
        {
            string uri = uriProvider(result.Value);
            return Results.Created(uri, new SuccessResponse<T>(result.Value));
        }
        return HandleFailure(result);
    }

    public static IResult ToNoContentMinimalApiResult(this Result result)
    {
        if (result.IsSuccess)
        {
            return Results.NoContent();
        }
        return HandleFailure(result);
    }

    private static IResult HandleFailure(ResultBase result)
    {
        var failResponse = new FailResponse<IEnumerable<string>>(
            result.Errors.Select(e => e.Message)
        );

        var firstError = result.Errors.FirstOrDefault();

        // Kiểm tra xem lỗi này có mang theo "HttpCode" trong Metadata không
        if (
            firstError != null
            && firstError.Metadata.TryGetValue("HttpCode", out var statusCodeObj)
            && statusCodeObj is int statusCode
        )
        {
            // Trả về HTTP Status Code
            return Results.Json(failResponse, statusCode: statusCode);
        }

        // Default
        return Results.BadRequest(failResponse);
    }
}
