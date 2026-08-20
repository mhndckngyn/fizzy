using Infrastructure.Database;
using Infrastructure.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Infrastructure;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services
            .AddOptions<EfCoreOptions>()
            .Bind(configuration.GetSection(EfCoreOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<AuditableEntitySaveChangesInterceptor>();
        services.AddDbContext<AppDbContext>(
            (sp, options) =>
            {
                var efCoreOptions = sp.GetRequiredService<IOptions<EfCoreOptions>>().Value;
                options.UseNpgsql(efCoreOptions.ConnectionString);
                options.AddInterceptors(
                    sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>()
                );
                options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            }
        );

        return services;
    }
}
