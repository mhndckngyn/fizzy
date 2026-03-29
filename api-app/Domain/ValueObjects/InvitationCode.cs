using FluentResults;

namespace Domain.ValueObjects;

public record InvitationCode
{
    private static readonly string CHARS =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    public string Value { get; init; }

    private InvitationCode(string value)
    {
        Value = value;
    }

    public static InvitationCode GenerateNew()
    {
        var random = new Random();
        string GetRandomPart() =>
            new([.. Enumerable.Repeat(CHARS, 4).Select(s => s[random.Next(s.Length)])]);

        string newCode = $"{GetRandomPart()}-{GetRandomPart()}-{GetRandomPart()}";

        return new InvitationCode(newCode);
    }

    public static Result<InvitationCode> Parse(string value)
    {
        if (!IsValid(value))
            return Result.Fail("Invalid invitation Code.");

        return Result.Ok(new InvitationCode(value));
    }

    private static bool IsValid(string code)
    {
        // Check length
        if (string.IsNullOrWhiteSpace(code) || code.Length != 14)
            return false;

        // Check format
        if (code[4] != '-' || code[9] != '-')
            return false;

        // Check ký tự
        for (int i = 0; i < code.Length; i++)
        {
            if (i == 4 || i == 9)
                continue;

            if (!CHARS.Contains(code[i]))
                return false;
        }

        return true;
    }
}
