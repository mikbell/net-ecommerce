using System;
using System.Text.Json;
using Core.Entities;
using Core.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class CartService(IConnectionMultiplexer redis, IDiscountService discountService) : ICartService
{
    private readonly IDatabase _database = redis.GetDatabase();

    public async Task<bool> DeleteCartAsync(string key)
    {
        return await _database.KeyDeleteAsync(key);
    }

    public async Task<ShoppingCart> GetCartAsync(string key)
    {
        var data = await _database.StringGetAsync(key);
        return data.IsNullOrEmpty ? null : JsonSerializer.Deserialize<ShoppingCart>(data!);
    }

    public async Task<ShoppingCart> SetCartAsync(ShoppingCart cart)
    {
        var created = await _database.StringSetAsync(cart.Id, JsonSerializer.Serialize(cart), TimeSpan.FromDays(30));
        if (!created) return null;
        return await GetCartAsync(cart.Id);
    }

    public async Task<ShoppingCart?> ApplyDiscountToCartAsync(string cartId, string discountCode)
    {
        var cart = await GetCartAsync(cartId);
        if (cart == null) return null;

        // Calcola il subtotale del carrello
        var subtotal = cart.Items.Sum(item => item.Price * item.Quantity);

        // Prova ad applicare lo sconto
        var appliedDiscount = await discountService.ApplyDiscountAsync(discountCode, subtotal);
        
        if (appliedDiscount != null)
        {
            cart.AppliedDiscount = appliedDiscount;
            return await SetCartAsync(cart);
        }

        return null;
    }
}
