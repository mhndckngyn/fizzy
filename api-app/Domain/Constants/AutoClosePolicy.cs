namespace Domain.Constants;

public static class AutoClosePolicy
{
    public static readonly IReadOnlySet<int> ValidPeriodDays = new HashSet<int>
    {
        3,
        7,
        11,
        30,
        90,
        365,
    };

    public static bool IsValidPeriod(int days) => ValidPeriodDays.Contains(days);
}
