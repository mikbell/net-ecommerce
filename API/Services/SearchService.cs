using System.Text.RegularExpressions;
using API.Models;

namespace API.Services;

public interface ISearchService
{
    SearchQuery ParseSearchQuery(string? search);
    bool IsPartialMatch(string text, string searchTerm, double threshold = 0.7);
    string[] ExtractSearchTerms(string? search);
    (decimal? MinPrice, decimal? MaxPrice) ParsePriceRange(string? priceRange);
    string[] ParseCommaSeparatedValues(string? values);
}

public class SearchService : ISearchService
{
    public SearchQuery ParseSearchQuery(string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
            return new SearchQuery();

        var query = new SearchQuery { OriginalQuery = search };
        
        // Estrai frasi esatte (tra virgolette)
        var exactPhraseMatches = Regex.Matches(search, "\"([^\"]+)\"");
        foreach (Match match in exactPhraseMatches)
        {
            query.ExactPhrases.Add(match.Groups[1].Value);
        }
        
        // Rimuovi le frasi esatte per processare il resto
        var remainingQuery = Regex.Replace(search, "\"([^\"]+)\"", "");
        
        // Gestisci operatori AND/OR
        if (remainingQuery.Contains(" AND ", StringComparison.OrdinalIgnoreCase))
        {
            query.Operator = SearchOperator.And;
            query.Terms = remainingQuery
                .Split(" AND ", StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
        }
        else if (remainingQuery.Contains(" OR ", StringComparison.OrdinalIgnoreCase))
        {
            query.Operator = SearchOperator.Or;
            query.Terms = remainingQuery
                .Split(" OR ", StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
        }
        else
        {
            // Ricerca semplice - tutti i termini (default AND)
            query.Operator = SearchOperator.And;
            query.Terms = remainingQuery
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
        }
        
        return query;
    }

    public bool IsPartialMatch(string text, string searchTerm, double threshold = 0.7)
    {
        if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(searchTerm))
            return false;

        text = text.ToLower();
        searchTerm = searchTerm.ToLower();
        
        // Controllo esatto
        if (text.Contains(searchTerm))
            return true;
            
        // Calcolo della similarità di Levenshtein
        var similarity = CalculateSimilarity(text, searchTerm);
        return similarity >= threshold;
    }

    public string[] ExtractSearchTerms(string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
            return Array.Empty<string>();

        return search
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(t => t.Trim().ToLower())
            .Where(t => t.Length > 1) // Ignora parole di una lettera
            .Distinct()
            .ToArray();
    }

    public (decimal? MinPrice, decimal? MaxPrice) ParsePriceRange(string? priceRange)
    {
        if (string.IsNullOrWhiteSpace(priceRange))
            return (null, null);

        return priceRange.ToLower() switch
        {
            "0-25" => (0m, 25m),
            "25-50" => (25m, 50m),
            "50-100" => (50m, 100m),
            "100-200" => (100m, 200m),
            "200-500" => (200m, 500m),
            "500+" => (500m, null),
            "100+" => (100m, null),
            _ => ParseCustomRange(priceRange)
        };
    }

    public string[] ParseCommaSeparatedValues(string? values)
    {
        if (string.IsNullOrWhiteSpace(values))
            return Array.Empty<string>();

        return values
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(v => v.Trim())
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .ToArray();
    }

    private (decimal? MinPrice, decimal? MaxPrice) ParseCustomRange(string priceRange)
    {
        // Supporta formati come "10-50", "100+", "<100"
        if (priceRange.EndsWith("+"))
        {
            var minStr = priceRange[..^1];
            if (decimal.TryParse(minStr, out var min))
                return (min, null);
        }
        else if (priceRange.StartsWith("<"))
        {
            var maxStr = priceRange[1..];
            if (decimal.TryParse(maxStr, out var max))
                return (null, max);
        }
        else if (priceRange.Contains("-"))
        {
            var parts = priceRange.Split('-');
            if (parts.Length == 2 &&
                decimal.TryParse(parts[0], out var min) &&
                decimal.TryParse(parts[1], out var max))
                return (min, max);
        }

        return (null, null);
    }

    private double CalculateSimilarity(string text, string searchTerm)
    {
        // Implementazione semplificata della distanza di Levenshtein
        var distance = LevenshteinDistance(text, searchTerm);
        var maxLength = Math.Max(text.Length, searchTerm.Length);
        return 1.0 - (double)distance / maxLength;
    }

    private int LevenshteinDistance(string s1, string s2)
    {
        var matrix = new int[s1.Length + 1, s2.Length + 1];

        for (int i = 0; i <= s1.Length; i++)
            matrix[i, 0] = i;

        for (int j = 0; j <= s2.Length; j++)
            matrix[0, j] = j;

        for (int i = 1; i <= s1.Length; i++)
        {
            for (int j = 1; j <= s2.Length; j++)
            {
                var cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                matrix[i, j] = Math.Min(
                    Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                    matrix[i - 1, j - 1] + cost);
            }
        }

        return matrix[s1.Length, s2.Length];
    }
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
