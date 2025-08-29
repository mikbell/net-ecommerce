namespace API.Models;

public class ProductParams
{
    private const int MaxPageSize = 50;
    
    public int PageIndex { get; set; } = 1;
    
    private int _pageSize = 6;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

    public string? Brand { get; set; }
    public string? Type { get; set; }
    public string? Sort { get; set; }
    public string? Search { get; set; }
    
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}
