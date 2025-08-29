namespace API.Models;

public class PagedResult<T>
{
    public PagedResult(IReadOnlyList<T> data, int count, int pageIndex, int pageSize)
    {
        Data = data;
        PageIndex = pageIndex;
        PageSize = pageSize;
        Count = count;
    }

    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int Count { get; set; }
    public IReadOnlyList<T> Data { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)Count / PageSize);
    public bool HasPrevious => PageIndex > 1;
    public bool HasNext => PageIndex < TotalPages;
}
