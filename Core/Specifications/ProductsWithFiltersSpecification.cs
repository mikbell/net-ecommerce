using Core.Entities;

namespace Core.Specifications;

public class ProductsWithFiltersSpecification : BaseSpecification<Product>
{
    public ProductsWithFiltersSpecification(ProductsSpecParams specParams) 
        : base(x =>
            (string.IsNullOrEmpty(specParams.Search) || x.Name.ToLower().Contains(specParams.Search.ToLower()) ||
             x.Description.ToLower().Contains(specParams.Search.ToLower())) &&
            (string.IsNullOrEmpty(specParams.Brand) || x.Brand == specParams.Brand) &&
            (string.IsNullOrEmpty(specParams.Type) || x.Type == specParams.Type) &&
            (!specParams.MinPrice.HasValue || x.Price >= specParams.MinPrice) &&
            (!specParams.MaxPrice.HasValue || x.Price <= specParams.MaxPrice)
        )
    {
        // Applica ordinamento
        ApplySorting(specParams.Sort);
        
        // Applica paginazione
        ApplyPaging(specParams.PageSize * (specParams.PageIndex - 1), specParams.PageSize);
    }

    public ProductsWithFiltersSpecification(int id) : base(x => x.Id == id)
    {
    }

    private void ApplySorting(string? sort)
    {
        switch (sort?.ToLower())
        {
            case "priceasc":
                ApplyOrderBy(x => x.Price);
                break;
            case "pricedesc":
                ApplyOrderByDescending(x => x.Price);
                break;
            case "nameasc":
                ApplyOrderBy(x => x.Name);
                break;
            case "namedesc":
                ApplyOrderByDescending(x => x.Name);
                break;
            case "brandasc":
                ApplyOrderBy(x => x.Brand);
                break;
            case "branddesc":
                ApplyOrderByDescending(x => x.Brand);
                break;
            case "typeasc":
                ApplyOrderBy(x => x.Type);
                break;
            case "typedesc":
                ApplyOrderByDescending(x => x.Type);
                break;
            default:
                // Ordinamento predefinito per nome
                ApplyOrderBy(x => x.Name);
                break;
        }
    }
}

public class ProductsSpecParams
{
    private const int MaxPageSize = 50;
    
    public int PageIndex { get; set; } = 1;
    
    private int _pageSize = 6;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

    public string? Brand { get; set; }
    public string? Type { get; set; }
    public string? Sort { get; set; }
    public string? Search { get; set; }
    
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}
