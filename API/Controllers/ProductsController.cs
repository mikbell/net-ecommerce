using API.Errors;
using AutoMapper;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductRepository repo, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts(string? brand, string? type, string? sort)
    {
        var products = await repo.GetProductsAsync(brand, type, sort);
        var productsDto = mapper.Map<IReadOnlyList<ProductDto>>(products);
        return Ok(productsDto);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await repo.GetProductByIdAsync(id);
        if (product == null) return NotFound(new ApiResponse(404, $"Product with ID {id} not found."));

        return Ok(mapper.Map<ProductDto>(product));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createDto)
    {
        if (!ModelState.IsValid) return BadRequest(new ApiValidationErrorResponse(ModelState));

        var product = mapper.Map<Product>(createDto);
        await repo.AddProductAsync(product);
        await repo.SaveChangesAsync();

        var productDto = mapper.Map<ProductDto>(product);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto updateDto)
    {
        if (!ModelState.IsValid) return BadRequest(new ApiValidationErrorResponse(ModelState));
        if (id != updateDto.Id) return BadRequest(new ApiResponse(400, "ID mismatch."));

        if (!await repo.ProductExistsAsync(id)) return NotFound(new ApiResponse(404, $"Product with ID {id} not found."));

        var product = mapper.Map<Product>(updateDto);
        repo.UpdateProduct(product);
        await repo.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await repo.GetProductByIdAsync(id);
        if (product == null) return NotFound(new ApiResponse(404, $"Product with ID {id} not found."));

        repo.DeleteProduct(product);
        await repo.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var brands = await repo.GetBrandsAsync();
        return Ok(brands);
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var types = await repo.GetTypesAsync();
        return Ok(types);
    }
}
