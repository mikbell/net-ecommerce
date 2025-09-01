using System.ComponentModel.DataAnnotations;

// DTO per l'output del carrello
public class CartDto
{
    public string Id { get; set; } = null!;
    public List<CartItemDto> Items { get; set; } = [];
    public AppliedDiscountDto? AppliedDiscount { get; set; }
    public decimal Subtotal => Items.Sum(item => item.Price * item.Quantity);
    public decimal DiscountAmount => AppliedDiscount?.DiscountAmount ?? 0;
    public decimal Total => Subtotal - DiscountAmount;
    public int TotalItems => Items.Sum(item => item.Quantity);
}

// DTO per gli articoli nel carrello
public class CartItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public decimal Price { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "La quantità deve essere almeno 1")]
    public int Quantity { get; set; }
    public string PictureUrl { get; set; } = null!;
    public string Brand { get; set; } = null!;
    public string Type { get; set; } = null!;
}

// DTO per aggiungere/aggiornare un articolo nel carrello
public class AddCartItemDto
{
    [Required(ErrorMessage = "L'ID del prodotto è obbligatorio")]
    public int ProductId { get; set; }
    
    [Required(ErrorMessage = "Il nome del prodotto è obbligatorio")]
    public string ProductName { get; set; } = null!;
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Il prezzo deve essere maggiore di 0")]
    public decimal Price { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "La quantità deve essere almeno 1")]
    public int Quantity { get; set; }
    
    [Required(ErrorMessage = "L'URL dell'immagine è obbligatorio")]
    public string PictureUrl { get; set; } = null!;
    
    [Required(ErrorMessage = "Il brand è obbligatorio")]
    public string Brand { get; set; } = null!;
    
    [Required(ErrorMessage = "Il tipo è obbligatorio")]
    public string Type { get; set; } = null!;
}

// DTO per aggiornare la quantità di un articolo
public class UpdateCartItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "La quantità deve essere almeno 1")]
    public int Quantity { get; set; }
}

// DTO per lo sconto applicato
public class AppliedDiscountDto
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
    public decimal Value { get; set; }
    public decimal DiscountAmount { get; set; }
}

// DTO per applicare uno sconto
public class ApplyDiscountDto
{
    [Required(ErrorMessage = "Il codice sconto è obbligatorio")]
    public string Code { get; set; } = null!;
}
