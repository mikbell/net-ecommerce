using System.Linq.Expressions;
using Core.Entities;

namespace Core.Specifications;

public class AdvancedProductSearchForCountSpecification : BaseSpecification<Product>
{
    public AdvancedProductSearchForCountSpecification(AdvancedSearchParams searchParams) 
        : base(BuildSearchExpression(searchParams))
    {
        // Non applica ordinamento o paginazione per il conteggio
    }

    private static Expression<Func<Product, bool>> BuildSearchExpression(AdvancedSearchParams searchParams)
    {
        Expression<Func<Product, bool>> expression = x => true;

        // Ricerca testuale avanzata
        if (!string.IsNullOrWhiteSpace(searchParams.Search))
        {
            var searchQuery = ParseSearchQuery(searchParams.Search);
            expression = CombineExpressions(expression, BuildTextSearchExpression(searchQuery), ExpressionType.AndAlso);
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

    private static Expression<Func<Product, bool>> BuildTextSearchExpression(SearchQuery query)
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
}
