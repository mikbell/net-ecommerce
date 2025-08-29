using System.Net;
using System.Text.Json;
using API.Errors;
using API.Exceptions;

namespace API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var (statusCode, message, details) = GetErrorDetails(exception);
        context.Response.StatusCode = statusCode;

        // Log dell'errore con livello appropriato
        LogException(exception, statusCode);

        object response = exception switch
        {
            ValidationException validationEx => new ApiValidationErrorResponse
            {
                StatusCode = statusCode,
                Message = message,
                Details = details,
                Errors = validationEx.Errors
            },
            _ => new ApiResponse(statusCode, message, details)
        };

        var options = new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _env.IsDevelopment()
        };

        var json = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(json);
    }

    private (int StatusCode, string Message, string? Details) GetErrorDetails(Exception exception)
    {
        return exception switch
        {
            // Le eccezioni personalizzate ereditate da ApiException devono essere gestite prima di ApiException
            NotFoundException => (404, exception.Message, GetDevDetails(exception)),
            BadRequestException => (400, exception.Message, GetDevDetails(exception)),
            UnauthorizedException => (401, exception.Message, GetDevDetails(exception)),
            ForbiddenException => (403, exception.Message, GetDevDetails(exception)),
            ConflictException => (409, exception.Message, GetDevDetails(exception)),
            ValidationException => (400, "Validation failed", GetDevDetails(exception)),
            // ApiException generico (deve essere dopo le eccezioni specifiche)
            ApiException apiEx => ((int)apiEx.StatusCode, apiEx.Message, _env.IsDevelopment() ? apiEx.Details ?? exception.StackTrace : apiEx.Details),
            // Eccezioni standard .NET (più specifiche prima)
            ArgumentNullException => (400, "Required parameter is missing", GetDevDetails(exception)),
            ArgumentException => (400, exception.Message, GetDevDetails(exception)),
            InvalidOperationException => (400, exception.Message, GetDevDetails(exception)),
            UnauthorizedAccessException => (403, "Access denied", GetDevDetails(exception)),
            TimeoutException => (408, "Request timeout", GetDevDetails(exception)),
            NotImplementedException => (501, "Feature not implemented", GetDevDetails(exception)),
            _ => (500, _env.IsDevelopment() ? exception.Message : "An error occurred while processing your request.", GetDevDetails(exception))
        };
    }

    private string? GetDevDetails(Exception exception)
    {
        return _env.IsDevelopment() ? exception.StackTrace : null;
    }

    private void LogException(Exception exception, int statusCode)
    {
        var logLevel = statusCode switch
        {
            >= 500 => LogLevel.Error,
            >= 400 => LogLevel.Warning,
            _ => LogLevel.Information
        };

        _logger.Log(logLevel, exception, 
            "HTTP {StatusCode} - {ExceptionType}: {Message}", 
            statusCode, 
            exception.GetType().Name, 
            exception.Message);
    }
}
