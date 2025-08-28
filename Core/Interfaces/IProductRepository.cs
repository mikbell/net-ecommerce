using Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IProductRepository
    {
        Task<IReadOnlyList<string>> GetBrandsAsync();
        Task<IReadOnlyList<string>> GetTypesAsync();

        Task AddProductAsync(Product product);
        void DeleteProduct(Product product);
        Task<Product?> GetProductByIdAsync(int id);
        Task<IReadOnlyList<Product>> GetProductsAsync(string? brands, string? types, string? sort);
        Task<bool> ProductExistsAsync(int id);
        Task<bool> SaveChangesAsync();
        void UpdateProduct(Product product);
    }
}
