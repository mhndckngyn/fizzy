using Infrastructure.Database;
using Infrastructure.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        string? connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddSingleton<AuditableEntitySaveChangesInterceptor>();
        services.AddDbContext<AppDbContext>(
            (sp, options) =>
            {
                options.UseNpgsql(connectionString);
                options.AddInterceptors(
                    sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>()
                );
                options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            }
        );

        return services;
    }
}
