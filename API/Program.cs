using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using API;
using API.Extensions;
using API.Middleware;
using API.Services;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// -------------------- LOGGING --------------------

// Configurazione Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/ecommerce-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting up the application");

    // -------------------- SERVICES --------------------

    // Controllers
    builder.Services.AddControllers();

    // Swagger/OpenAPI
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // DbContext
    builder.Services.AddDbContext<StoreContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Repository
    builder.Services.AddScoped<IProductRepository, ProductRepository>();
    builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

    // AutoMapper
    builder.Services.AddAutoMapper(typeof(MappingProfiles));

    // Error Handling
    builder.Services.AddErrorHandling();

    // Search Services
    builder.Services.AddScoped<ISearchService, SearchService>();

    // CORS (adatta l'URL del frontend)
    builder.Services.AddCors(opt =>
    {
        opt.AddPolicy("CorsPolicy", policy =>
        {
            policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:4200", "https://localhost:4200"); // Cambia con il tuo frontend
        });
    });

    var app = builder.Build();

    // -------------------- MIDDLEWARE --------------------

    // Logging delle richieste
    app.UseSerilogRequestLogging(options =>
    {
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.FirstOrDefault() ?? "Unknown");
        };
    });

    // Error handling middleware
    app.UseErrorHandling();

    // CORS
    app.UseCors("CorsPolicy");

    // Swagger
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Routing
    app.MapControllers();

    // -------------------- DATABASE MIGRATION & SEED --------------------

    try
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<StoreContext>();

        Log.Information("Applying migrations...");
        await context.Database.MigrateAsync();

        Log.Information("Seeding database...");
        await StoreContextSeed.SeedAsync(context);

        Log.Information("Database ready.");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "An error occurred during migration/seeding");
        throw;
    }

    // -------------------- RUN APP --------------------

    Log.Information("Starting the application");
    app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
