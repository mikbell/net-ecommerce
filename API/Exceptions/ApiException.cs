using System.Net;

namespace API.Exceptions;

public class ApiException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string? Details { get; }

    public ApiException(HttpStatusCode statusCode, string message, string? details = null)
        : base(message)
    {
        StatusCode = statusCode;
        Details = details;
    }
}

public class NotFoundException : ApiException
{
    public NotFoundException(string message) 
        : base(HttpStatusCode.NotFound, message)
    {
    }
}

public class BadRequestException : ApiException
{
    public BadRequestException(string message, string? details = null) 
        : base(HttpStatusCode.BadRequest, message, details)
    {
    }
}

public class ValidationException : ApiException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors) 
        : base(HttpStatusCode.BadRequest, "Validation failed")
    {
        Errors = errors;
    }
}

public class UnauthorizedException : ApiException
{
    public UnauthorizedException(string message) 
        : base(HttpStatusCode.Unauthorized, message)
    {
    }
}

public class ForbiddenException : ApiException
{
    public ForbiddenException(string message) 
        : base(HttpStatusCode.Forbidden, message)
    {
    }
}

public class ConflictException : ApiException
{
    public ConflictException(string message) 
        : base(HttpStatusCode.Conflict, message)
    {
    }
}
