using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace API.Errors
{
    public class ApiValidationErrorResponse : ApiResponse
    {
        public IDictionary<string, string[]>? Errors { get; set; }

        public ApiValidationErrorResponse(ModelStateDictionary modelState)
            : base(400)
        {
            Errors = modelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );
        }

        public ApiValidationErrorResponse() : base(400, "Validation failed")
        {
        }
    }
}
