using Core.Entities;

namespace Core.Specifications;

public enum ProductSortOrder
{
    PriceAscending,
    PriceDescending,
    NameAscending,
    NameDescending
}

public class ProductSpecification : BaseSpecification<Product>
{
    public ProductSpecification(string? brand, string? type, ProductSortOrder? sortOrder = null)
        : base(x =>
            (string.IsNullOrEmpty(brand) || x.Brand == brand) &&
            (string.IsNullOrEmpty(type) || x.Type == type)
        )
    {
        // Applica ordinamento in base al parametro sortOrder
        switch (sortOrder)
        {
            case ProductSortOrder.PriceAscending:
                ApplyOrderBy(x => x.Price);
                break;
            case ProductSortOrder.PriceDescending:
                ApplyOrderByDescending(x => x.Price);
                break;
            case ProductSortOrder.NameAscending:
                ApplyOrderBy(x => x.Name);
                break;
            case ProductSortOrder.NameDescending:
                ApplyOrderByDescending(x => x.Name);
                break;
            default:
                // Ordinamento predefinito per nome
                ApplyOrderBy(x => x.Name);
                break;
        }
        
        // Esempio: se vuoi includere relazioni
        // AddInclude(x => x.Category);
        // AddInclude(x => x.BrandNavigation);
    }

    public ProductSpecification(int id)
        : base(x => x.Id == id)
    {
    }
}
