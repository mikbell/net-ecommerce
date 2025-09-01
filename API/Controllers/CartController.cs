using AutoMapper;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using API.Errors;
using API.Extensions;
using API.Exceptions;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController(ICartService cartService, IMapper mapper, ILogger<CartController> logger) : ControllerBase
{
    /// <summary>
    /// Ottiene il carrello per l'ID specificato
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <returns>Il carrello richiesto</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<CartDto>> GetCart(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        try
        {
            var cart = await cartService.GetCartAsync(id);
            
            // Se il carrello non esiste, ne creiamo uno vuoto
            cart ??= new ShoppingCart { Id = id };
            
            var cartDto = mapper.Map<CartDto>(cart);
            return Ok(cartDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving cart with ID {CartId}", id);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error retrieving cart", ex.Message);
        }
    }

    /// <summary>
    /// Aggiunge un articolo al carrello o aggiorna la quantità se già presente
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <param name="addItemDto">Dati dell'articolo da aggiungere</param>
    /// <returns>Il carrello aggiornato</returns>
    [HttpPost("{id}/items")]
    public async Task<ActionResult<CartDto>> AddItemToCart(string id, [FromBody] AddCartItemDto addItemDto)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        if (addItemDto == null)
            throw new BadRequestException("Item data is required");

        try
        {
            // Ottieni il carrello esistente o creane uno nuovo
            var cart = await cartService.GetCartAsync(id) ?? new ShoppingCart { Id = id };
            
            // Cerca se l'articolo è già nel carrello
            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == addItemDto.ProductId);
            
            if (existingItem != null)
            {
                // Aggiorna la quantità dell'articolo esistente
                existingItem.Quantity += addItemDto.Quantity;
            }
            else
            {
                // Aggiungi nuovo articolo
                var newItem = mapper.Map<CartItem>(addItemDto);
                cart.Items.Add(newItem);
            }
            
            // Salva il carrello aggiornato in Redis
            var updatedCart = await cartService.SetCartAsync(cart) ?? throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to update cart");
            var cartDto = mapper.Map<CartDto>(updatedCart);
            return Ok(cartDto);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error adding item to cart {CartId} with data {@AddItemDto}", id, addItemDto);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error adding item to cart", ex.Message);
        }
    }

    /// <summary>
    /// Aggiorna la quantità di un articolo nel carrello
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <param name="productId">ID del prodotto da aggiornare</param>
    /// <param name="updateDto">Nuova quantità</param>
    /// <returns>Il carrello aggiornato</returns>
    [HttpPut("{id}/items/{productId:int}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(string id, int productId, [FromBody] UpdateCartItemDto updateDto)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        if (productId <= 0)
            throw new BadRequestException("Product ID must be greater than 0");

        if (updateDto == null)
            throw new BadRequestException("Update data is required");

        try
        {
            var cart = await cartService.GetCartAsync(id) ?? throw new NotFoundException($"Cart with ID {id} not found");
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId) ?? throw new NotFoundException($"Product with ID {productId} not found in cart");

            // Aggiorna la quantità
            item.Quantity = updateDto.Quantity;
            
            // Salva il carrello aggiornato
            var updatedCart = await cartService.SetCartAsync(cart);
            
            if (updatedCart == null)
                throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to update cart");
            
            var cartDto = mapper.Map<CartDto>(updatedCart);
            return Ok(cartDto);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error updating item {ProductId} in cart {CartId} with data {@UpdateDto}", productId, id, updateDto);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error updating cart item", ex.Message);
        }
    }

    /// <summary>
    /// Rimuove un articolo dal carrello
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <param name="productId">ID del prodotto da rimuovere</param>
    /// <returns>Il carrello aggiornato</returns>
    [HttpDelete("{id}/items/{productId:int}")]
    public async Task<ActionResult<CartDto>> RemoveItemFromCart(string id, int productId)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        if (productId <= 0)
            throw new BadRequestException("Product ID must be greater than 0");

        try
        {
            var cart = await cartService.GetCartAsync(id);
            
            if (cart == null)
                throw new NotFoundException($"Cart with ID {id} not found");
            
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            
            if (item == null)
                throw new NotFoundException($"Product with ID {productId} not found in cart");
            
            // Rimuovi l'articolo dal carrello
            cart.Items.Remove(item);
            
            // Salva il carrello aggiornato
            var updatedCart = await cartService.SetCartAsync(cart) ?? throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to update cart");
            var cartDto = mapper.Map<CartDto>(updatedCart);
            return Ok(cartDto);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error removing item {ProductId} from cart {CartId}", productId, id);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error removing item from cart", ex.Message);
        }
    }

    /// <summary>
    /// Svuota completamente il carrello
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <returns>Conferma dell'operazione</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCart(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        try
        {
            var deleted = await cartService.DeleteCartAsync(id);
            
            if (!deleted)
            {
                // Il carrello potrebbe non esistere, ma questo non è un errore
                logger.LogInformation("Cart {CartId} was not found or already deleted", id);
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting cart {CartId}", id);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error deleting cart", ex.Message);
        }
    }

    /// <summary>
    /// Applica un codice sconto al carrello
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <param name="discountDto">Dati del codice sconto da applicare</param>
    /// <returns>Il carrello con lo sconto applicato</returns>
    [HttpPost("{id}/discount")]
    public async Task<ActionResult<CartDto>> ApplyDiscountToCart(string id, [FromBody] ApplyDiscountDto discountDto)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        if (discountDto == null || string.IsNullOrWhiteSpace(discountDto.Code))
            throw new BadRequestException("Discount code is required");

        try
        {
            var updatedCart = await cartService.ApplyDiscountToCartAsync(id, discountDto.Code);
            
            if (updatedCart == null)
                throw new BadRequestException("Invalid discount code or cart not found");
            
            var cartDto = mapper.Map<CartDto>(updatedCart);
            return Ok(cartDto);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error applying discount {Code} to cart {CartId}", discountDto.Code, id);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error applying discount", ex.Message);
        }
    }

    /// <summary>
    /// Sostituisce completamente il contenuto del carrello
    /// </summary>
    /// <param name="id">ID univoco del carrello</param>
    /// <param name="cartDto">Nuovi dati del carrello</param>
    /// <returns>Il carrello aggiornato</returns>
    [HttpPost("{id}")]
    public async Task<ActionResult<CartDto>> UpdateCart(string id, [FromBody] CartDto cartDto)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new BadRequestException("Cart ID is required");

        if (cartDto == null)
            throw new BadRequestException("Cart data is required");

        if (cartDto.Id != id)
            throw new BadRequestException("Cart ID in URL does not match cart ID in body");

        try
        {
            // Converte il DTO in entità
            var cart = new ShoppingCart
            {
                Id = cartDto.Id,
                Items = mapper.Map<List<CartItem>>(cartDto.Items)
            };
            
            // Salva il carrello in Redis
            var updatedCart = await cartService.SetCartAsync(cart) ?? throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to update cart");
            var resultDto = mapper.Map<CartDto>(updatedCart);
            return Ok(resultDto);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error updating cart {CartId} with data {@CartDto}", id, cartDto);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error updating cart", ex.Message);
        }
    }
}
