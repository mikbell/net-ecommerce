using System.Security.Claims;
using API.Errors;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;

    public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserEmailExistsAsync(registerDto.Email))
        {
            return BadRequest(new ApiResponse(400, "Email address is already in use"));
        }

        var user = new AppUser
        {
            Email = registerDto.Email,
            UserName = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            EmailConfirmed = true // Per semplicità, considerando l'email già confermata
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new ApiResponse(400, "Failed to create user"));
        }

        return new UserDto
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Token = await _tokenService.CreateTokenAsync(user)
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);

        if (user == null)
        {
            return Unauthorized(new ApiResponse(401, "Invalid email or password"));
        }

        if (!user.IsActive)
        {
            return Unauthorized(new ApiResponse(401, "Account is deactivated"));
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        if (!result.Succeeded)
        {
            return Unauthorized(new ApiResponse(401, "Invalid email or password"));
        }

        // Aggiorna il timestamp dell'ultimo accesso
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return new UserDto
        {
            Email = user.Email!,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            Token = await _tokenService.CreateTokenAsync(user)
        };
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<AppUser>> GetProfile()
    {
        var user = await GetCurrentUserAsync();
        if (user == null)
        {
            return NotFound(new ApiResponse(404, "User not found"));
        }

        return Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<AppUser>> UpdateProfile(UpdateProfileDto updateDto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null)
        {
            return NotFound(new ApiResponse(404, "User not found"));
        }

        user.FirstName = updateDto.FirstName ?? user.FirstName;
        user.LastName = updateDto.LastName ?? user.LastName;
        user.Address = updateDto.Address ?? user.Address;
        user.City = updateDto.City ?? user.City;
        user.PostalCode = updateDto.PostalCode ?? user.PostalCode;
        user.Country = updateDto.Country ?? user.Country;
        
        if (updateDto.DateOfBirth.HasValue)
        {
            user.DateOfBirth = updateDto.DateOfBirth.Value;
        }

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new ApiResponse(400, "Failed to update profile"));
        }

        return Ok(user);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null)
        {
            return NotFound(new ApiResponse(404, "User not found"));
        }

        var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new ApiResponse(400, "Failed to change password"));
        }

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpGet("email-exists")]
    public async Task<ActionResult<bool>> CheckEmailExists([FromQuery] string email)
    {
        return await UserEmailExistsAsync(email);
    }

    [Authorize]
    [HttpGet("current-user")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await GetCurrentUserAsync();
        if (user == null)
        {
            return NotFound(new ApiResponse(404, "User not found"));
        }

        return new UserDto
        {
            Email = user.Email!,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            Token = await _tokenService.CreateTokenAsync(user)
        };
    }

    private async Task<bool> UserEmailExistsAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email) != null;
    }

    private async Task<AppUser?> GetCurrentUserAsync()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        return email != null ? await _userManager.FindByEmailAsync(email) : null;
    }
}
