
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace api_app
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // Các config cơ bản
                options.Authority = builder.Configuration["AuthApi:BaseUrl"];
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["AuthApi:Issuer"],

                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["AuthApi:Audience"],

                    ValidateIssuerSigningKey = true,

                    // tải key từ JWKS endpoint
                    IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
                    {
                        var jwksUrl = builder.Configuration["AuthApi:JwksUrl"];

                        using var client = new HttpClient();
                        try
                        {
                            var response = client.GetStringAsync(jwksUrl).Result;
                            var keySet = new JsonWebKeySet(response);

                            return keySet.GetSigningKeys();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Lỗi tải JWKS: " + ex.Message);
                            return [];
                        }
                    }
                };
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
