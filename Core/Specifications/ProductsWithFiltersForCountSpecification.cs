using Core.Entities;

namespace Core.Specifications;

public class ProductsWithFiltersForCountSpecification : BaseSpecification<Product>
{
    public ProductsWithFiltersForCountSpecification(ProductsSpecParams specParams) 
        : base(x =>
            (string.IsNullOrEmpty(specParams.Search) || x.Name.ToLower().Contains(specParams.Search.ToLower()) ||
             x.Description.ToLower().Contains(specParams.Search.ToLower())) &&
            (string.IsNullOrEmpty(specParams.Brand) || x.Brand == specParams.Brand) &&
            (string.IsNullOrEmpty(specParams.Type) || x.Type == specParams.Type) &&
            (!specParams.MinPrice.HasValue || x.Price >= specParams.MinPrice) &&
            (!specParams.MaxPrice.HasValue || x.Price <= specParams.MaxPrice)
        )
    {
        // Non applica ordinamento o paginazione per il conteggio
    }
}
