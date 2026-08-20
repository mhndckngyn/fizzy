using Carter;
using Feature.AutoCloseFeature;
using Feature.BackgroundServices.AuthEventHandler;
using Feature.Hubs;
using Feature.Middlewares;
using Feature.NotificationFeature.NotificationProcessor;
using Feature.NotificationFeature.NotificationStrategies;
using Feature.Options;
using Feature.UserFeature;
using Hangfire;
using Hangfire.PostgreSql;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Secrets (real credentials/connection strings) are layered on top of appsettings.json /
// appsettings.{Environment}.json from a file that's never committed. Locally this defaults to
// a gitignored file next to appsettings.json; in Compose, SECRETS_FILE_PATH is overridden to
// point at a mounted Docker secret instead.
var secretsFilePath =
    Environment.GetEnvironmentVariable("SECRETS_FILE_PATH") ?? "appsettings.Secrets.json";
builder.Configuration.AddJsonFile(secretsFilePath, optional: true, reloadOnChange: false);

// Add services to the container.

builder.Services.AddCarter();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true) // allow file:// (null origin) and any localhost in dev
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // required for SignalR
    });
});

builder.Services.AddMediatR(options =>
{
    options.RegisterServicesFromAssembly(typeof(Program).Assembly);
});

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddInfrastructureServices(builder.Configuration);

builder
    .Services.AddOptions<AuthApiOptions>()
    .Bind(builder.Configuration.GetSection(AuthApiOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

var authApiOptions = builder
    .Configuration.GetSection(AuthApiOptions.SectionName)
    .Get<AuthApiOptions>()!;

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authApiOptions.BaseUrl;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            ValidateIssuer = true,
            ValidIssuer = authApiOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = authApiOptions.Audience,
        };
        // SignalR WebSocket clients pass the token via query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Query["access_token"];
                if (
                    !string.IsNullOrEmpty(token)
                    && context.HttpContext.Request.Path.StartsWithSegments("/hubs")
                )
                    context.Token = token;
                return Task.CompletedTask;
            },
        };
    });

builder
    .Services.AddOptions<HangfireOptions>()
    .Bind(builder.Configuration.GetSection(HangfireOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddHangfire(
    (sp, cfg) =>
    {
        var hangfireOptions = sp.GetRequiredService<IOptions<HangfireOptions>>().Value;
        cfg.UsePostgreSqlStorage(options =>
        {
            options.UseNpgsqlConnection(hangfireOptions.ConnectionString);
        });
    }
);
builder.Services.AddHangfireServer();

builder.Services.AddSingleton<EventDispatchInterceptor>();
builder.Services.AddSingleton<ISaveChangesInterceptor>(sp =>
    sp.GetRequiredService<EventDispatchInterceptor>()
);

builder.Services.AddScoped<IEventProcessor, EventProcessor>();
builder.Services.AddScoped<INotificationStrategy, AssignStrategy>();
builder.Services.AddScoped<INotificationStrategy, BoardWatcherStrategy>();
builder.Services.AddScoped<INotificationStrategy, CommentStrategy>();
builder.Services.AddScoped<INotificationStrategy, MentionStrategy>();

builder.Services.AddScoped<IAutoCloseJob, AutoCloseJob>();
builder.Services.AddScoped<IUserDeletionJob, UserDeletionJob>();

builder
    .Services.AddOptions<RabbitMqOptions>()
    .Bind(builder.Configuration.GetSection(RabbitMqOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder
    .Services.AddOptions<RedisOptions>()
    .Bind(builder.Configuration.GetSection(RedisOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var redisOptions = sp.GetRequiredService<IOptions<RedisOptions>>().Value;
    return ConnectionMultiplexer.Connect(redisOptions.ConnectionString);
});
builder.Services.AddSingleton<IUserCache, RedisUserCache>();

builder.Services.AddHostedService<UserDeleteReceiverService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseExceptionHandler(options => { });

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<UserProvisioner>();

app.UseHangfireDashboard("/hangfire");

RecurringJob.AddOrUpdate<IAutoCloseJob>("auto-close-cards", job => job.RunAsync(), Cron.Hourly());

app.MapCarter();
app.MapHub<NotificationHub>("/hubs/notifications").RequireAuthorization();

app.Run();
