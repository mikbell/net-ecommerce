using System.Linq.Expressions;
using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class SpecificationEvaluator<T> where T : BaseEntity
{
    public static IQueryable<T> GetQuery(IQueryable<T> query, ISpecification<T> spec)
    {
        if (spec.Criteria != null)
        {
            query = query.Where(spec.Criteria);
        }

        if (spec.OrderBy != null)
        {
            query = query.OrderBy(spec.OrderBy);
        }

        if (spec.OrderByDescending != null)
        {
            query = query.OrderByDescending(spec.OrderByDescending);
        }

        // Applica paginazione (dopo l'ordinamento per coerenza)
        if (spec.IsPagingEnabled)
        {
            if (spec.Skip.HasValue)
                query = query.Skip(spec.Skip.Value);
            if (spec.Take.HasValue)
                query = query.Take(spec.Take.Value);
        }

        // Applica Include con espressioni
        if (spec.Includes != null)
        {
            query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));
        }

        // Applica Include tramite stringhe (IncludeStrings)
        if (spec.IncludeStrings != null)
        {
            foreach (var includeString in spec.IncludeStrings)
            {
                query = query.Include(includeString);
            }
        }

        return query;
    }
}
