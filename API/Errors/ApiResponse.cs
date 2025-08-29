namespace API.Errors
{
    public class ApiResponse
    {
        public ApiResponse(int statusCode, string? message = null, string? details = null)
        {
            StatusCode = statusCode;
            Message = message ?? GetDefaultMessageForStatusCode(statusCode);
            Details = details;
        }

        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string? Details { get; set; }

        private static string GetDefaultMessageForStatusCode(int statusCode)
        {
            return statusCode switch
            {
                400 => "You have made a bad request",
                401 => "You are not authorized",
                403 => "You are forbidden from accessing this resource",
                404 => "Resource not found",
                408 => "Request timeout",
                409 => "Conflict occurred",
                500 => "A server error has occurred",
                501 => "Feature not implemented",
                _ => "Unknown error"
            };
        }
    }
}
