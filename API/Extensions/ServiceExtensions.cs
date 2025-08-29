using API.Middleware;
using API.Errors;
using Microsoft.AspNetCore.Mvc;

namespace API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddErrorHandling(this IServiceCollection services)
    {
        // Configurazione per model state errors
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = actionContext =>
            {
                var errors = actionContext.ModelState
                    .Where(e => e.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                var validationErrorResponse = new ApiValidationErrorResponse
                {
                    Message = "Validation failed",
                    Errors = errors
                };

                return new BadRequestObjectResult(validationErrorResponse);
            };
        });

        return services;
    }

    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionMiddleware>();
        return app;
    }
}

public static class ControllerExtensions
{
    public static IActionResult HandleResult<T>(this ControllerBase controller, T? result, string notFoundMessage = "Resource not found")
    {
        if (result == null)
            return controller.NotFound(new ApiResponse(404, notFoundMessage));
        
        return controller.Ok(result);
    }

    public static async Task<IActionResult> HandleResultAsync<T>(this ControllerBase controller, Task<T?> resultTask, string notFoundMessage = "Resource not found")
    {
        var result = await resultTask;
        return controller.HandleResult(result, notFoundMessage);
    }
}
