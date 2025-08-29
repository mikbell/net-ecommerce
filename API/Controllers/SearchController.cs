using System.Diagnostics;
using API.Exceptions;
using API.Models;
using API.Services;
using AutoMapper;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(
    IGenericRepository<Product> repo, 
    IMapper mapper, 
    ISearchService searchService,
    ILogger<SearchController> logger) : ControllerBase
{
    [HttpGet("products")]
    public async Task<ActionResult<SearchResult<ProductDto>>> SearchProducts([FromQuery] SearchParams searchParams)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            // Validazione parametri
            if (searchParams.PageIndex < 1)
                throw new BadRequestException("PageIndex must be greater than 0");
            
            if (searchParams.PageSize < 1)
                throw new BadRequestException("PageSize must be greater than 0");

            // Parse dei parametri avanzati
            var advancedParams = new AdvancedSearchParams
            {
                PageIndex = searchParams.PageIndex,
                PageSize = searchParams.PageSize,
                Search = searchParams.AdvancedSearch ?? searchParams.Search,
                Sort = searchParams.Sort,
                MinPrice = searchParams.MinPrice,
                MaxPrice = searchParams.MaxPrice,
                InStockOnly = searchParams.InStockOnly,
                EnableFuzzySearch = searchParams.EnableFuzzySearch,
                SimilarityThreshold = searchParams.SimilarityThreshold,
                Brands = searchService.ParseCommaSeparatedValues(searchParams.Brands),
                Types = searchService.ParseCommaSeparatedValues(searchParams.Types)
            };

            // Gestione price range predefiniti
            if (!string.IsNullOrWhiteSpace(searchParams.PriceRange))
            {
                var (minPrice, maxPrice) = searchService.ParsePriceRange(searchParams.PriceRange);
                advancedParams.MinPrice ??= minPrice;
                advancedParams.MaxPrice ??= maxPrice;
            }

            var spec = new AdvancedProductSearchSpecification(advancedParams);
            var countSpec = new AdvancedProductSearchSpecification(new AdvancedSearchParams
            {
                Search = advancedParams.Search,
                Brands = advancedParams.Brands,
                Types = advancedParams.Types,
                MinPrice = advancedParams.MinPrice,
                MaxPrice = advancedParams.MaxPrice,
                InStockOnly = advancedParams.InStockOnly,
                EnableFuzzySearch = advancedParams.EnableFuzzySearch
                // Non includere paginazione per il conteggio
            });

            var totalItems = await repo.CountAsync(countSpec);
            var products = await repo.ListAsync(spec);

            var productDtos = mapper.Map<IReadOnlyList<ProductDto>>(products);
            
            stopwatch.Stop();

            var result = new SearchResult<ProductDto>
            {
                Results = productDtos,
                TotalCount = totalItems,
                PageIndex = searchParams.PageIndex,
                PageSize = searchParams.PageSize,
                SearchTerms = searchService.ExtractSearchTerms(advancedParams.Search),
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                FiltersApplied = new SearchFiltersApplied
                {
                    Brands = advancedParams.Brands,
                    Types = advancedParams.Types,
                    MinPrice = advancedParams.MinPrice,
                    MaxPrice = advancedParams.MaxPrice,
                    SortBy = advancedParams.Sort,
                    InStockOnly = advancedParams.InStockOnly
                }
            };

            logger.LogInformation("Search completed in {ExecutionTime}ms for query: {SearchQuery}", 
                stopwatch.ElapsedMilliseconds, advancedParams.Search);

            return Ok(result);
        }
        catch (Exception ex) when (ex is not ApiException)
        {
            stopwatch.Stop();
            logger.LogError(ex, "Error performing search with parameters {@SearchParams}", searchParams);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Search failed", ex.Message);
        }
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<IReadOnlyList<SearchSuggestion>>> GetSearchSuggestions(
        [FromQuery] string? query, 
        [FromQuery] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return Ok(new List<SearchSuggestion>());

        try
        {
            var suggestions = new List<SearchSuggestion>();
            var queryLower = query.ToLower();

            // Suggerimenti dai prodotti
            var products = await repo.ListAllAsync();
            var productSuggestions = products
                .Where(p => p.Name.ToLower().Contains(queryLower))
                .Take(limit / 2)
                .Select(p => new SearchSuggestion
                {
                    Text = p.Name,
                    Type = SearchSuggestionType.Product,
                    Count = 1
                });

            suggestions.AddRange(productSuggestions);

            // Suggerimenti dai brand
            var brandSuggestions = products
                .Where(p => p.Brand.ToLower().Contains(queryLower))
                .GroupBy(p => p.Brand)
                .Select(g => new SearchSuggestion
                {
                    Text = g.Key,
                    Type = SearchSuggestionType.Brand,
                    Count = g.Count()
                })
                .Take(limit / 4);

            suggestions.AddRange(brandSuggestions);

            // Suggerimenti dai tipi
            var typeSuggestions = products
                .Where(p => p.Type.ToLower().Contains(queryLower))
                .GroupBy(p => p.Type)
                .Select(g => new SearchSuggestion
                {
                    Text = g.Key,
                    Type = SearchSuggestionType.Type,
                    Count = g.Count()
                })
                .Take(limit / 4);

            suggestions.AddRange(typeSuggestions);

            var result = suggestions
                .OrderByDescending(s => s.Count)
                .ThenBy(s => s.Text)
                .Take(limit)
                .ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to get suggestions", ex.Message);
        }
    }

    [HttpGet("price-ranges")]
    public async Task<ActionResult<IReadOnlyList<PriceRangeOption>>> GetPriceRanges()
    {
        try
        {
            var products = await repo.ListAllAsync();
            
            var priceRanges = new List<PriceRangeOption>
            {
                new() { Key = "0-25", Label = "Sotto €25", MinPrice = 0, MaxPrice = 25, Count = products.Count(p => p.Price <= 25) },
                new() { Key = "25-50", Label = "€25 - €50", MinPrice = 25, MaxPrice = 50, Count = products.Count(p => p.Price >= 25 && p.Price <= 50) },
                new() { Key = "50-100", Label = "€50 - €100", MinPrice = 50, MaxPrice = 100, Count = products.Count(p => p.Price >= 50 && p.Price <= 100) },
                new() { Key = "100-200", Label = "€100 - €200", MinPrice = 100, MaxPrice = 200, Count = products.Count(p => p.Price >= 100 && p.Price <= 200) },
                new() { Key = "200+", Label = "Oltre €200", MinPrice = 200, MaxPrice = null, Count = products.Count(p => p.Price >= 200) }
            };

            return Ok(priceRanges.Where(pr => pr.Count > 0).ToList());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting price ranges");
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to get price ranges", ex.Message);
        }
    }

    [HttpGet("filters")]
    public async Task<ActionResult<object>> GetSearchFilters([FromQuery] string? currentSearch)
    {
        try
        {
            var products = await repo.ListAllAsync();
            
            // Se c'è una ricerca in corso, filtra i suggerimenti in base ai risultati
            if (!string.IsNullOrWhiteSpace(currentSearch))
            {
                var searchTerms = searchService.ExtractSearchTerms(currentSearch);
                products = products.Where(p => 
                    searchTerms.Any(term => 
                        p.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                        p.Description.Contains(term, StringComparison.OrdinalIgnoreCase)
                    )).ToList();
            }

            var brands = products
                .GroupBy(p => p.Brand)
                .Select(g => new { value = g.Key, label = g.Key, count = g.Count() })
                .OrderBy(b => b.label)
                .ToList();

            var types = products
                .GroupBy(p => p.Type)
                .Select(g => new { value = g.Key, label = g.Key, count = g.Count() })
                .OrderBy(t => t.label)
                .ToList();

            var priceStats = new
            {
                min = products.Any() ? products.Min(p => p.Price) : 0,
                max = products.Any() ? products.Max(p => p.Price) : 0,
                avg = products.Any() ? products.Average(p => p.Price) : 0
            };

            return Ok(new
            {
                brands,
                types,
                priceStats,
                totalProducts = products.Count(),
                inStockProducts = products.Count(p => p.QuantityInStock > 0),
                sortOptions = new[]
                {
                    new { value = "relevance", label = "Rilevanza" },
                    new { value = "priceasc", label = "Prezzo: dal più basso" },
                    new { value = "pricedesc", label = "Prezzo: dal più alto" },
                    new { value = "nameasc", label = "Nome: A-Z" },
                    new { value = "namedesc", label = "Nome: Z-A" },
                    new { value = "newest", label = "Più recenti" },
                    new { value = "popular", label = "Più popolari" }
                }
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting search filters");
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to get filters", ex.Message);
        }
    }

    [HttpGet("popular-terms")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetPopularSearchTerms([FromQuery] int limit = 10)
    {
        try
        {
            // Implementazione semplificata - in produzione si userebbe una cache o database delle ricerche
            var products = await repo.ListAllAsync();
            
            var popularTerms = new List<string>();
            
            // Estrai termini comuni dai nomi dei prodotti
            var allWords = products
                .SelectMany(p => p.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                .Where(w => w.Length > 3) // Parole di almeno 4 caratteri
                .GroupBy(w => w.ToLower())
                .OrderByDescending(g => g.Count())
                .Take(limit)
                .Select(g => g.Key)
                .ToList();

            popularTerms.AddRange(allWords);

            // Aggiungi brand popolari
            var popularBrands = products
                .GroupBy(p => p.Brand)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            popularTerms.AddRange(popularBrands);

            return Ok(popularTerms.Distinct().Take(limit).ToList());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting popular search terms");
            throw new ApiException(System.Net.HttpStatusCode.InternalServerError, "Failed to get popular terms", ex.Message);
        }
    }
}
