using Domain.Entities;
using Domain.ValueObjects;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Feature.TeamFeatures;

public static class CreateInvitationCode
{
    public static async Task<InvitationCode> GetOrGenerateAsync(
        AppDbContext dbContext,
        Team team,
        CancellationToken cancellationToken
    )
    {
        if (team.InvitationCode is not null)
        {
            return team.InvitationCode;
        }

        InvitationCode newCode = null!;
        bool isUnique = false;

        while (!isUnique)
        {
            newCode = InvitationCode.GenerateNew();
            bool isExists = await dbContext.Teams.AnyAsync(
                t => t.InvitationCode == newCode,
                cancellationToken
            );

            if (!isExists)
                isUnique = true;
        }

        team.InvitationCode = newCode;

        return newCode;
    }
}
