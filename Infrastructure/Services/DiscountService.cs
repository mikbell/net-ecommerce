using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class DiscountService : IDiscountService
{
    private readonly ILogger<DiscountService> _logger;
    
    // Per ora usiamo una lista hardcoded, in futuro si può aggiungere un repository
    private readonly List<DiscountCode> _discountCodes = new()
    {
        new DiscountCode
        {
            Id = 1,
            Code = "WELCOME10",
            Name = "Sconto di Benvenuto 10%",
            Description = "Sconto del 10% per i nuovi clienti",
            Type = DiscountType.Percentage,
            Value = 10,
            MinOrderAmount = 50,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow.AddDays(30),
            UsageLimit = 1000,
            IsActive = true
        },
        new DiscountCode
        {
            Id = 2,
            Code = "SAVE20",
            Name = "Risparmia 20€",
            Description = "Sconto fisso di 20€",
            Type = DiscountType.FixedAmount,
            Value = 20,
            MinOrderAmount = 100,
            MaxDiscountAmount = 20,
            StartDate = DateTime.UtcNow.AddDays(-15),
            EndDate = DateTime.UtcNow.AddDays(15),
            UsageLimit = 500,
            IsActive = true
        },
        new DiscountCode
        {
            Id = 3,
            Code = "SUMMER15",
            Name = "Saldi Estivi 15%",
            Description = "Sconto del 15% per la promozione estiva",
            Type = DiscountType.Percentage,
            Value = 15,
            MinOrderAmount = 75,
            MaxDiscountAmount = 50,
            StartDate = DateTime.UtcNow.AddDays(-10),
            EndDate = DateTime.UtcNow.AddDays(20),
            IsActive = true
        }
    };

    public DiscountService(ILogger<DiscountService> logger)
    {
        _logger = logger;
    }

    public async Task<DiscountCode?> GetDiscountCodeAsync(string code)
    {
        await Task.CompletedTask; // Simula operazione asincrona
        
        var discountCode = _discountCodes
            .FirstOrDefault(d => d.Code.Equals(code, StringComparison.OrdinalIgnoreCase) && d.IsActive);
            
        _logger.LogInformation("Searched for discount code {Code}, found: {Found}", code, discountCode != null);
        return discountCode;
    }

    public async Task<AppliedDiscount?> ApplyDiscountAsync(string code, decimal subtotal)
    {
        var discountCode = await GetDiscountCodeAsync(code);
        
        if (discountCode == null)
        {
            _logger.LogWarning("Discount code {Code} not found", code);
            return null;
        }

        if (!await ValidateDiscountCodeAsync(code, subtotal))
        {
            _logger.LogWarning("Discount code {Code} validation failed", code);
            return null;
        }

        decimal discountAmount = CalculateDiscountAmount(discountCode, subtotal);

        var appliedDiscount = new AppliedDiscount
        {
            Code = discountCode.Code,
            Name = discountCode.Name,
            Type = discountCode.Type,
            Value = discountCode.Value,
            DiscountAmount = discountAmount
        };

        _logger.LogInformation("Applied discount {Code} with amount {Amount}", code, discountAmount);
        return appliedDiscount;
    }

    public async Task<bool> ValidateDiscountCodeAsync(string code, decimal subtotal)
    {
        var discountCode = await GetDiscountCodeAsync(code);
        
        if (discountCode == null)
        {
            return false;
        }

        // Verifica se il codice è attivo
        if (!discountCode.IsActive)
        {
            _logger.LogWarning("Discount code {Code} is not active", code);
            return false;
        }

        // Verifica se il codice è nel periodo di validità
        var now = DateTime.UtcNow;
        if (now < discountCode.StartDate || now > discountCode.EndDate)
        {
            _logger.LogWarning("Discount code {Code} is not in valid date range", code);
            return false;
        }

        // Verifica ordine minimo
        if (discountCode.MinOrderAmount.HasValue && subtotal < discountCode.MinOrderAmount)
        {
            _logger.LogWarning("Discount code {Code} minimum order amount not met. Required: {Required}, Actual: {Actual}", 
                code, discountCode.MinOrderAmount, subtotal);
            return false;
        }

        // Verifica limite di utilizzo (in un'implementazione reale dovremmo controllare il database)
        if (discountCode.UsageLimit.HasValue && discountCode.UsageCount >= discountCode.UsageLimit)
        {
            _logger.LogWarning("Discount code {Code} usage limit reached", code);
            return false;
        }

        return true;
    }

    private decimal CalculateDiscountAmount(DiscountCode discountCode, decimal subtotal)
    {
        decimal discountAmount = 0;

        if (discountCode.Type == DiscountType.Percentage)
        {
            discountAmount = subtotal * (discountCode.Value / 100);
        }
        else if (discountCode.Type == DiscountType.FixedAmount)
        {
            discountAmount = discountCode.Value;
        }

        // Applica il limite massimo di sconto se specificato
        if (discountCode.MaxDiscountAmount.HasValue)
        {
            discountAmount = Math.Min(discountAmount, discountCode.MaxDiscountAmount.Value);
        }

        // Assicurati che lo sconto non superi il subtotale
        discountAmount = Math.Min(discountAmount, subtotal);

        return Math.Round(discountAmount, 2);
    }
}
