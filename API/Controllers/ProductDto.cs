// DTO per l’output
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public string PictureUrl { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Brand { get; set; } = null!;
    public int QuantityInStock { get; set; }
}

// DTO per la creazione
public class CreateProductDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public string PictureUrl { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Brand { get; set; } = null!;
    public int QuantityInStock { get; set; }
}

// DTO per l’update
public class UpdateProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public string PictureUrl { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Brand { get; set; } = null!;
    public int QuantityInStock { get; set; }
}
