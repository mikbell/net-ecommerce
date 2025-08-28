using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using API;

var builder = WebApplication.CreateBuilder(args);

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

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfiles));

// CORS (adatta l’URL del frontend)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:3000"); // Cambia con il tuo frontend
    });
});

var app = builder.Build();

// -------------------- MIDDLEWARE --------------------

// Middleware globale per errori
app.UseMiddleware<ExceptionMiddleware>();

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
    var logger = services.GetRequiredService<ILogger<Program>>();

    logger.LogInformation("Applying migrations...");
    await context.Database.MigrateAsync();

    logger.LogInformation("Seeding database...");
    await StoreContextSeed.SeedAsync(context);

    logger.LogInformation("Database ready.");
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration/seeding.");
    throw;
}

// -------------------- RUN APP --------------------
app.Run();
