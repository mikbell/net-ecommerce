using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace API.Errors
{
    public class ApiValidationErrorResponse : ApiResponse
    {
        public IEnumerable<string> Errors { get; set; }

        public ApiValidationErrorResponse(ModelStateDictionary modelState)
            : base(400)
        {
            Errors = [.. modelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage)];
        }
    }
}