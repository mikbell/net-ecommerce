using API.Errors;
using API.Extensions;
using API.Exceptions;
using API.Models;
using AutoMapper;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IGenericRepository<Product> repo, IMapper mapper, ILogger<ProductsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductParams productParams)
    {
        // Validazione parametri
        if (productParams.PageIndex < 1)
            throw new BadRequestException("PageIndex must be greater than 0");
        
        if (productParams.PageSize < 1)
            throw new BadRequestException("PageSize must be greater than 0");
            
        if (productParams.MinPrice < 0)
            throw new BadRequestException("MinPrice cannot be negative");
            
        if (productParams.MaxPrice < 0)
            throw new BadRequestException("MaxPrice cannot be negative");
            
        if (productParams.MinPrice > productParams.MaxPrice)
            throw new BadRequestException("MinPrice cannot be greater than MaxPrice");

        try
        {
            // Logging per debugging
            logger.LogInformation("Received parameters: Brands={@Brands}, Types={@Types}, Brand={Brand}, Type={Type}", 
                productParams.Brands, productParams.Types, productParams.Brand, productParams.Type);
            
            int totalItems;
            IReadOnlyList<Product> products;
            
            // Se sono presenti array di brand/types, usa AdvancedProductSearchSpecification
            if ((productParams.Brands?.Length > 0) || (productParams.Types?.Length > 0))
            {
                var advancedParams = new AdvancedSearchParams
                {
                    PageIndex = productParams.PageIndex,
                    PageSize = productParams.PageSize,
                    Brands = productParams.Brands,
                    Types = productParams.Types,
                    Sort = productParams.Sort,
                    Search = productParams.Search,
                    MinPrice = productParams.MinPrice,
                    MaxPrice = productParams.MaxPrice
                };
                
                var advancedSpec = new AdvancedProductSearchSpecification(advancedParams);
                var advancedCountSpec = new AdvancedProductSearchForCountSpecification(advancedParams);
                
                totalItems = await repo.CountAsync(advancedCountSpec);
                products = await repo.ListAsync(advancedSpec);
            }
            else
            {
                // Converte ProductParams in ProductsSpecParams per filtri singoli
                var specParams = new ProductsSpecParams
                {
                    PageIndex = productParams.PageIndex,
                    PageSize = productParams.PageSize,
                    Brand = productParams.Brand,
                    Type = productParams.Type,
                    Sort = productParams.Sort,
                    Search = productParams.Search,
                    MinPrice = productParams.MinPrice,
                    MaxPrice = productParams.MaxPrice
                };

                var spec = new ProductsWithFiltersSpecification(specParams);
                var countSpec = new ProductsWithFiltersForCountSpecification(specParams);
                
                totalItems = await repo.CountAsync(countSpec);
                products = await repo.ListAsync(spec);
            }
            
            var data = mapper.Map<IReadOnlyList<ProductDto>>(products);
            
            return Ok(new PagedResult<ProductDto>(data, totalItems, productParams.PageIndex, productParams.PageSize));
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error retrieving products with parameters {@ProductParams}", productParams);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error retrieving products", ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        if (id <= 0)
            throw new BadRequestException("Product ID must be greater than 0");

        try
        {
            var spec = new ProductsWithFiltersSpecification(id);
            var product = await repo.GetEntityWithSpec(spec);
            
            if (product == null)
                throw new NotFoundException($"Product with ID {id} was not found");
                
            return Ok(mapper.Map<ProductDto>(product));
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error retrieving product with ID {ProductId}", id);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error retrieving product", ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createDto)
    {
        if (createDto == null)
            throw new BadRequestException("Product data is required");

        // Validazione business rules
        if (createDto.Price <= 0)
            throw new BadRequestException("Product price must be greater than 0");
            
        if (createDto.QuantityInStock < 0)
            throw new BadRequestException("Quantity in stock cannot be negative");

        try
        {
            var product = mapper.Map<Product>(createDto);
            repo.Add(product);
            
            if (!await repo.SaveAllAsync())
                throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to save product");

            var productDto = mapper.Map<ProductDto>(product);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error creating product {@CreateDto}", createDto);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error creating product", ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto updateDto)
    {
        if (id <= 0)
            throw new BadRequestException("Product ID must be greater than 0");
            
        if (updateDto == null)
            throw new BadRequestException("Product data is required");

        if (id != updateDto.Id)
            throw new BadRequestException("ID in URL does not match ID in request body");

        // Validazione business rules
        if (updateDto.Price <= 0)
            throw new BadRequestException("Product price must be greater than 0");
            
        if (updateDto.QuantityInStock < 0)
            throw new BadRequestException("Quantity in stock cannot be negative");

        try
        {
            if (!await repo.ExistsAsync(id))
                throw new NotFoundException($"Product with ID {id} not found");

            var product = mapper.Map<Product>(updateDto);
            repo.Update(product);
            
            if (!await repo.SaveAllAsync())
                throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to update product");

            return NoContent();
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error updating product {ProductId} with data {@UpdateDto}", id, updateDto);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error updating product", ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        if (id <= 0)
            throw new BadRequestException("Product ID must be greater than 0");

        try
        {
            if (!await repo.ExistsAsync(id))
                throw new NotFoundException($"Product with ID {id} not found");

            var product = await repo.GetByIdAsync(id);
            repo.Remove(product);
            
            if (!await repo.SaveAllAsync())
                throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to delete product");

            return NoContent();
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            logger.LogError(ex, "Error deleting product {ProductId}", id);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Error deleting product", ex.Message);
        }
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var brands = await repo.GetDistinctAsync(p => p.Brand);
        return Ok(brands);
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var types = await repo.GetDistinctAsync(p => p.Type);
        return Ok(types);
    }

    [HttpGet("filters")]
    public async Task<ActionResult<object>> GetFilters()
    {
        var brands = await repo.GetDistinctAsync(p => p.Brand);
        var types = await repo.GetDistinctAsync(p => p.Type);
        
        return Ok(new
        {
            brands = brands.OrderBy(b => b),
            types = types.OrderBy(t => t),
            sortOptions = new[]
            {
                new { value = "priceasc", label = "Prezzo: dal più basso" },
                new { value = "pricedesc", label = "Prezzo: dal più alto" },
                new { value = "nameasc", label = "Nome: A-Z" },
                new { value = "namedesc", label = "Nome: Z-A" },
                new { value = "brandasc", label = "Brand: A-Z" },
                new { value = "branddesc", label = "Brand: Z-A" },
                new { value = "typeasc", label = "Tipo: A-Z" },
                new { value = "typedesc", label = "Tipo: Z-A" }
            }
        });
    }
}
