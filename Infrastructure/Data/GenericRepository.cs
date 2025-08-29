using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly StoreContext _context;

        public GenericRepository(StoreContext context)
        {
            _context = context;
        }

        public void Add(T entity) => _context.Set<T>().Add(entity);

        public void Update(T entity)
        {
            _context.Set<T>().Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void Remove(T entity) => _context.Set<T>().Remove(entity);

        public async Task<IReadOnlyList<T>> ListAllAsync() =>
            await _context.Set<T>().ToListAsync();

        public async Task<T> GetByIdAsync(int id) =>
            await _context.Set<T>().FindAsync(id)
            ?? throw new InvalidOperationException($"Elemento non trovato con id {id}");

        public async Task<bool> SaveAllAsync() =>
            await _context.SaveChangesAsync() > 0;

        public async Task<bool> ExistsAsync(int id) =>
            await _context.Set<T>().AnyAsync(x => x.Id == id);

        public bool Exists(int id) =>
            _context.Set<T>().Any(x => x.Id == id);

        public IQueryable<T> AsQueryable() => _context.Set<T>().AsQueryable();

        public async Task<T> GetEntityWithSpec(ISpecification<T> spec)
        {
            return await ApplySpecification(spec).FirstOrDefaultAsync()
                ?? throw new InvalidOperationException("Entità non trovata");
        }

        public async Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec)
        {
            return await ApplySpecification(spec).ToListAsync();
        }

        public async Task<List<TResult>> GetDistinctAsync<TResult>(Func<T, TResult> selector)
        {
            var entities = await _context.Set<T>().ToListAsync();
            return entities.Select(selector).Distinct().ToList();
        }

        public async Task<int> CountAsync(ISpecification<T> spec)
        {
            return await ApplySpecificationForCount(spec).CountAsync();
        }

        private IQueryable<T> ApplySpecification(ISpecification<T> spec)
        {
            return SpecificationEvaluator<T>.GetQuery(_context.Set<T>().AsQueryable(), spec);
        }

        private IQueryable<T> ApplySpecificationForCount(ISpecification<T> spec)
        {
            var query = _context.Set<T>().AsQueryable();

            if (spec.Criteria != null)
            {
                query = query.Where(spec.Criteria);
            }

            return query;
        }
    }
}
