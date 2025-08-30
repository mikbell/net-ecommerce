# Implementazione della Paginazione - E-commerce

## Panoramica
La paginazione è stata implementata completamente sia nel backend (.NET) che nel frontend (Angular), fornendo una navigazione fluida attraverso i prodotti con controlli intuitivi.

## Backend (.NET)

### 1. Modello di Paginazione
```csharp
// API/Models/Pagination.cs
public class PagedResult<T>
{
    public int PageIndex { get; set; }      // Indice pagina corrente (1-based)
    public int PageSize { get; set; }       // Numero elementi per pagina
    public int Count { get; set; }          // Totale elementi
    public IReadOnlyList<T> Data { get; set; } // Dati della pagina corrente
    public int TotalPages => (int)Math.Ceiling((double)Count / PageSize);
    public bool HasPrevious => PageIndex > 1;
    public bool HasNext => PageIndex < TotalPages;
}
```

### 2. Parametri di Ricerca
```csharp
// ShopParams.cs
public class ShopParams
{
    public int pageIndex = 1;        // Pagina corrente
    public int pageSize = 12;        // Elementi per pagina
    public string[] brands = [];     // Filtri brand
    public string[] types = [];      // Filtri tipo
    public string sort = 'name';     // Ordinamento
}
```

### 3. Controller API
Il `ProductsController` supporta:
- Parametri di paginazione via query string
- Filtri multipli per brand e types
- Ordinamento personalizzabile
- Validazione parametri
- Response con metadati di paginazione

```csharp
[HttpGet]
public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductParams productParams)
```

## Frontend (Angular)

### 1. ShopService
```typescript
getProducts(shopParams: ShopParams) {
    let params = new HttpParams();
    
    // Gestisce array di filtri
    if (shopParams.brands && shopParams.brands.length > 0) {
        shopParams.brands.forEach((brand) => {
            params = params.append('brands', brand);
        });
    }
    
    // Parametri di paginazione
    params = params
        .append('pageIndex', shopParams.pageIndex.toString())
        .append('pageSize', shopParams.pageSize.toString());
}
```

### 2. ShopComponent
```typescript
export class ShopComponent {
    products: Product[] = [];
    pagination: Pagination<Product> | null = null;
    shopParams = new ShopParams();
    
    onPageChange(pageIndex: number) {
        this.shopParams.pageIndex = pageIndex;
        this.getProducts();
    }
    
    onPageSizeChange(pageSize: number) {
        this.shopParams.pageSize = pageSize;
        this.shopParams.pageIndex = 1; // Reset alla prima pagina
        this.getProducts();
    }
}
```

### 3. PaginationComponent
Componente riutilizzabile che include:

**Funzionalità:**
- Navigazione prima/ultima pagina
- Navigazione pagina precedente/successiva
- Selezione diretta delle pagine (max 5 visibili)
- Selezione dimensione pagina (6, 12, 24, 48)
- Informazioni su risultati mostrati ("Mostrando 1-12 di 45 risultati")

**Props:**
```typescript
@Input() currentPage: number = 1;
@Input() pageSize: number = 12;
@Input() totalCount: number = 0;
@Input() totalPages: number = 0;

@Output() pageChange = new EventEmitter<number>();
@Output() pageSizeChange = new EventEmitter<number>();
```

**Template:**
```html
<app-pagination
    [currentPage]="pagination.pageIndex"
    [pageSize]="pagination.pageSize"
    [totalCount]="pagination.count"
    [totalPages]="totalPages"
    (pageChange)="onPageChange($event)"
    (pageSizeChange)="onPageSizeChange($event)">
</app-pagination>
```

## Caratteristiche Implementate

### ✅ Navigazione Pagine
- **Prima/Ultima**: Vai direttamente alla prima o ultima pagina
- **Precedente/Successiva**: Navigazione sequenziale
- **Numerica**: Clic diretto su numero pagina (max 5 visibili)
- **Responsive**: Adattamento automatico per mobile

### ✅ Controllo Dimensioni
- Selezione dimensione pagina: 6, 12, 24, 48 elementi
- Reset automatico alla prima pagina quando si cambia dimensione

### ✅ Informazioni Contestuali
- "Mostrando X-Y di Z risultati"
- Indicazione pagina corrente
- Disabilitazione bottoni quando appropriato

### ✅ Integrazione con Filtri
- Reset automatico alla prima pagina quando si applicano filtri
- Mantenimento della paginazione attraverso operazioni di ricerca
- Compatibilità con filtri multipli (brand, type, sort)

### ✅ UX/UI Features
- **Material Design**: Utilizzo di Angular Material components
- **Tooltip**: Indicazioni chiare per i controlli
- **Loading States**: Gestione stati di caricamento
- **Error Handling**: Gestione errori con fallback

## Utilizzo

### Avvio Backend
```bash
cd C:\Users\Campa\wa\net\ecommerce\API
dotnet run
```

### Avvio Frontend
```bash
cd C:\Users\Campa\wa\net\ecommerce\frontend
ng serve
```

### Test API Diretti
```bash
# Pagina 1, 12 elementi
GET https://localhost:5001/api/products?pageIndex=1&pageSize=12

# Con filtri
GET https://localhost:5001/api/products?pageIndex=2&pageSize=6&brands=Nike&brands=Adidas&types=Scarpe

# Con ordinamento
GET https://localhost:5001/api/products?pageIndex=1&pageSize=24&sort=priceAsc
```

## File Modificati/Creati

### Backend
- `API/Models/Pagination.cs` - Modello paginazione (esistente)
- `API/Models/ProductParams.cs` - Aggiunto Brands[], Types[]
- `API/Controllers/ProductsController.cs` - Supporto array parametri
- `Core/Specifications/AdvancedProductSearchSpecification.cs` - Filtri avanzati
- `Core/Specifications/AdvancedProductSearchForCountSpecification.cs` - Nuovo

### Frontend
- `shared/models/shopParams.ts` - Corretto pageIndex
- `shared/components/pagination/pagination.component.ts` - Nuovo componente
- `core/services/shop.service.ts` - Supporto ShopParams
- `features/shop/shop.component.ts` - Integrazione paginazione
- `features/shop/shop.component.html` - Template con paginazione

## Note Tecniche
- Paginazione 1-based (pageIndex inizia da 1)
- Validazione lato server per parametri
- Ottimizzazione query con specifications pattern
- Componente paginazione completamente riutilizzabile
- Supporto completo per filtri multipli
- Design responsive per tutti i dispositivi
