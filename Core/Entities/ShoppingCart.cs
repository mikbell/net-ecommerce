using System;

namespace Core.Entities;

public class ShoppingCart
{
    public required string Id { get; set; }
    public List<CartItem> Items { get; set; } = [];
    public AppliedDiscount? AppliedDiscount { get; set; }
}

public class AppliedDiscount
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public DiscountType Type { get; set; }
    public decimal Value { get; set; }
    public decimal DiscountAmount { get; set; }
}
