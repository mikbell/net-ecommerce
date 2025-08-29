namespace API.Models;

public class SearchParams : ProductParams
{
    /// <summary>
    /// Ricerca full-text avanzata con operatori
    /// Supporta: "term1 AND term2", "term1 OR term2", "exact phrase"
    /// </summary>
    public string? AdvancedSearch { get; set; }
    
    /// <summary>
    /// Lista di brand (separati da virgola)
    /// Es: "Nike,Adidas,Puma"
    /// </summary>
    public string? Brands { get; set; }
    
    /// <summary>
    /// Lista di tipi (separati da virgola)
    /// Es: "Shoes,Clothing,Accessories"
    /// </summary>
    public string? Types { get; set; }
    
    /// <summary>
    /// Ricerca fuzzy (tolleranza errori di battitura)
    /// </summary>
    public bool EnableFuzzySearch { get; set; } = false;
    
    /// <summary>
    /// Livello di similarità per fuzzy search (0.0 - 1.0)
    /// </summary>
    public double SimilarityThreshold { get; set; } = 0.7;
    
    /// <summary>
    /// Fasce di prezzo predefinite
    /// </summary>
    public string? PriceRange { get; set; } // "0-25", "25-50", "50-100", "100+"
    
    /// <summary>
    /// Solo prodotti in stock
    /// </summary>
    public bool InStockOnly { get; set; } = false;
    
    /// <summary>
    /// Ricerca per tags (futura estensione)
    /// </summary>
    public string? Tags { get; set; }
}

public class SearchResult<T>
{
    public IReadOnlyList<T> Results { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPrevious => PageIndex > 1;
    public bool HasNext => PageIndex < TotalPages;
    
    /// <summary>
    /// Termini di ricerca effettivamente utilizzati
    /// </summary>
    public string[]? SearchTerms { get; set; }
    
    /// <summary>
    /// Filtri applicati
    /// </summary>
    public SearchFiltersApplied? FiltersApplied { get; set; }
    
    /// <summary>
    /// Tempo di esecuzione della ricerca in millisecondi
    /// </summary>
    public long ExecutionTimeMs { get; set; }
}

public class SearchFiltersApplied
{
    public string[]? Brands { get; set; }
    public string[]? Types { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; }
    public bool InStockOnly { get; set; }
}

public class SearchSuggestion
{
    public string Text { get; set; } = string.Empty;
    public SearchSuggestionType Type { get; set; }
    public int Count { get; set; } // Numero di prodotti che corrispondono
}

public enum SearchSuggestionType
{
    Product,
    Brand,
    Type,
    Category
}

public class PriceRangeOption
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int Count { get; set; }
}
