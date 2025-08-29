using System.Linq.Expressions;
using Core.Entities;

namespace Core.Specifications;

public class AdvancedProductSearchSpecification : BaseSpecification<Product>
{
    public AdvancedProductSearchSpecification(AdvancedSearchParams searchParams) 
        : base(BuildSearchExpression(searchParams))
    {
        // Applica ordinamento
        ApplySorting(searchParams.Sort);
        
        // Applica paginazione
        ApplyPaging(searchParams.PageSize * (searchParams.PageIndex - 1), searchParams.PageSize);
    }

    private static Expression<Func<Product, bool>> BuildSearchExpression(AdvancedSearchParams searchParams)
    {
        Expression<Func<Product, bool>> expression = x => true;

        // Ricerca testuale avanzata
        if (!string.IsNullOrWhiteSpace(searchParams.Search))
        {
            var searchQuery = ParseSearchQuery(searchParams.Search);
            expression = CombineExpressions(expression, BuildTextSearchExpression(searchQuery, searchParams.EnableFuzzySearch), ExpressionType.AndAlso);
        }

        // Filtro per brand multipli
        if (searchParams.Brands?.Any() == true)
        {
            expression = CombineExpressions(expression, x => searchParams.Brands.Contains(x.Brand), ExpressionType.AndAlso);
        }

        // Filtro per tipi multipli
        if (searchParams.Types?.Any() == true)
        {
            expression = CombineExpressions(expression, x => searchParams.Types.Contains(x.Type), ExpressionType.AndAlso);
        }

        // Filtro prezzo
        if (searchParams.MinPrice.HasValue)
        {
            expression = CombineExpressions(expression, x => x.Price >= searchParams.MinPrice.Value, ExpressionType.AndAlso);
        }

        if (searchParams.MaxPrice.HasValue)
        {
            expression = CombineExpressions(expression, x => x.Price <= searchParams.MaxPrice.Value, ExpressionType.AndAlso);
        }

        // Solo prodotti in stock
        if (searchParams.InStockOnly)
        {
            expression = CombineExpressions(expression, x => x.QuantityInStock > 0, ExpressionType.AndAlso);
        }

        return expression;
    }

    private static SearchQuery ParseSearchQuery(string search)
    {
        var query = new SearchQuery { OriginalQuery = search };
        
        // Gestione semplificata - può essere estesa con il SearchService
        if (search.Contains(" AND ", StringComparison.OrdinalIgnoreCase))
        {
            query.Operator = SearchOperator.And;
            query.Terms = search.Split(" AND ", StringSplitOptions.RemoveEmptyEntries)
                               .Select(t => t.Trim())
                               .ToList();
        }
        else if (search.Contains(" OR ", StringComparison.OrdinalIgnoreCase))
        {
            query.Operator = SearchOperator.Or;
            query.Terms = search.Split(" OR ", StringSplitOptions.RemoveEmptyEntries)
                               .Select(t => t.Trim())
                               .ToList();
        }
        else
        {
            query.Operator = SearchOperator.And;
            query.Terms = search.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                               .Select(t => t.Trim())
                               .ToList();
        }

        return query;
    }

    private static Expression<Func<Product, bool>> BuildTextSearchExpression(SearchQuery query, bool enableFuzzy)
    {
        Expression<Func<Product, bool>>? searchExpression = null;

        foreach (var term in query.Terms)
        {
            var termLower = term.ToLower();
            Expression<Func<Product, bool>> termExpression = x => 
                x.Name.ToLower().Contains(termLower) || 
                x.Description.ToLower().Contains(termLower) ||
                x.Brand.ToLower().Contains(termLower) ||
                x.Type.ToLower().Contains(termLower);

            if (searchExpression == null)
            {
                searchExpression = termExpression;
            }
            else
            {
                var combineType = query.Operator == SearchOperator.And ? ExpressionType.AndAlso : ExpressionType.OrElse;
                searchExpression = CombineExpressions(searchExpression, termExpression, combineType);
            }
        }

        return searchExpression ?? (x => true);
    }

    private static Expression<Func<Product, bool>> CombineExpressions(
        Expression<Func<Product, bool>> left,
        Expression<Func<Product, bool>> right,
        ExpressionType combineType)
    {
        var parameter = Expression.Parameter(typeof(Product), "x");
        var leftBody = ReplaceParameterVisitor.Replace(left.Body, left.Parameters[0], parameter);
        var rightBody = ReplaceParameterVisitor.Replace(right.Body, right.Parameters[0], parameter);
        
        var combinedBody = combineType == ExpressionType.AndAlso 
            ? Expression.AndAlso(leftBody, rightBody)
            : Expression.OrElse(leftBody, rightBody);
            
        return Expression.Lambda<Func<Product, bool>>(combinedBody, parameter);
    }

    private void ApplySorting(string? sort)
    {
        switch (sort?.ToLower())
        {
            case "relevance":
                // Per ora usa il nome, in futuro si può implementare un ranking
                ApplyOrderBy(x => x.Name);
                break;
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
            case "newest":
                ApplyOrderByDescending(x => x.Id); // Assumendo che ID più alto = più recente
                break;
            case "popular":
                // Per ora ordina per quantità in stock (proxy per popolarità)
                ApplyOrderByDescending(x => x.QuantityInStock);
                break;
            default:
                ApplyOrderBy(x => x.Name);
                break;
        }
    }
}

// Classe per supportare il replace dei parametri nelle expressions
public class ReplaceParameterVisitor : ExpressionVisitor
{
    private readonly ParameterExpression _oldParameter;
    private readonly ParameterExpression _newParameter;

    private ReplaceParameterVisitor(ParameterExpression oldParameter, ParameterExpression newParameter)
    {
        _oldParameter = oldParameter;
        _newParameter = newParameter;
    }

    public static Expression Replace(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
    {
        return new ReplaceParameterVisitor(oldParameter, newParameter).Visit(expression)!;
    }

    protected override Expression VisitParameter(ParameterExpression node)
    {
        return node == _oldParameter ? _newParameter : node;
    }
}

public class AdvancedSearchParams
{
    private const int MaxPageSize = 50;
    
    public int PageIndex { get; set; } = 1;
    
    private int _pageSize = 6;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

    public string? Search { get; set; }
    public string[]? Brands { get; set; }
    public string[]? Types { get; set; }
    public string? Sort { get; set; }
    
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    
    public bool InStockOnly { get; set; } = false;
    public bool EnableFuzzySearch { get; set; } = false;
    public double SimilarityThreshold { get; set; } = 0.7;
}

public class SearchQuery
{
    public string OriginalQuery { get; set; } = string.Empty;
    public SearchOperator Operator { get; set; } = SearchOperator.And;
    public List<string> Terms { get; set; } = new();
    public List<string> ExactPhrases { get; set; } = new();
}

public enum SearchOperator
{
    And,
    Or
}
