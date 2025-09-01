using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Data;

public class IdentitySeed
{
    public static async Task SeedUsersAsync(UserManager<AppUser> userManager, ILogger logger)
    {
        if (!userManager.Users.Any())
        {
            // Admin user
            var admin = new AppUser
            {
                Email = "admin@test.com",
                UserName = "admin@test.com",
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                Address = "Via Roma 123",
                City = "Milano",
                PostalCode = "20100",
                Country = "Italia",
                DateOfBirth = new DateTime(1980, 1, 1)
            };

            var result = await userManager.CreateAsync(admin, "Password123!");
            if (result.Succeeded)
            {
                logger.LogInformation("Admin user created successfully");
            }
            else
            {
                logger.LogError("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            // Regular user
            var user = new AppUser
            {
                Email = "user@test.com",
                UserName = "user@test.com",
                FirstName = "Test",
                LastName = "User",
                EmailConfirmed = true,
                Address = "Via Milano 456",
                City = "Roma",
                PostalCode = "00100",
                Country = "Italia",
                DateOfBirth = new DateTime(1990, 5, 15)
            };

            result = await userManager.CreateAsync(user, "Password123!");
            if (result.Succeeded)
            {
                logger.LogInformation("Regular user created successfully");
            }
            else
            {
                logger.LogError("Failed to create regular user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
    }
}
