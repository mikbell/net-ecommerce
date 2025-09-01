using Core.Entities;

namespace Core.Interfaces;

public interface IDiscountService
{
    Task<DiscountCode?> GetDiscountCodeAsync(string code);
    Task<AppliedDiscount?> ApplyDiscountAsync(string code, decimal subtotal);
    Task<bool> ValidateDiscountCodeAsync(string code, decimal subtotal);
}
