# 🛒 Carrello E-commerce con Redis

Implementazione completa del sistema di carrello per l'API e-commerce usando Redis come storage ad alte prestazioni.

## 🚀 Caratteristiche Implementate

### ✅ Architettura Completata

1. **Entità Core**:
   - `ShoppingCart`: Entità principale del carrello
   - `CartItem`: Singoli articoli nel carrello
   - `ICartService`: Interfaccia per le operazioni del carrello

2. **Servizio Redis**:
   - `CartService`: Implementazione con StackExchange.Redis
   - Persistenza automatica con scadenza di 30 giorni
   - Serializzazione JSON per performance ottimali

3. **API Controllers**:
   - `CartController`: Endpoint RESTful completi
   - Validazione completa degli input
   - Gestione errori robusta
   - Logging strutturato

4. **DTO e Mappings**:
   - `CartDto`, `CartItemDto`: Output API
   - `AddCartItemDto`, `UpdateCartItemDto`: Input API
   - AutoMapper configurato per conversioni automatiche

## 🔧 Configurazione

### Redis
```json
{
  "ConnectionStrings": {
    "Redis": "localhost"
  }
}
```

### Dependency Injection
Il `CartService` è registrato come Singleton in `Program.cs`:
```csharp
builder.Services.AddSingleton<IConnectionMultiplexer>(config =>
{
    var connString = builder.Configuration.GetConnectionString("Redis");
    var configuration = ConfigurationOptions.Parse(connString, true);
    return ConnectionMultiplexer.Connect(configuration);
});

builder.Services.AddSingleton<ICartService, CartService>();
```

## 🌐 Endpoints API

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/cart/{id}` | Ottiene il carrello (crea se non esiste) |
| `POST` | `/api/cart/{id}/items` | Aggiunge articolo al carrello |
| `PUT` | `/api/cart/{id}/items/{productId}` | Aggiorna quantità articolo |
| `DELETE` | `/api/cart/{id}/items/{productId}` | Rimuove articolo dal carrello |
| `DELETE` | `/api/cart/{id}` | Svuota completamente il carrello |
| `POST` | `/api/cart/{id}` | Sostituisce contenuto carrello |

## 📝 Esempi di Utilizzo

### Ottenere un carrello
```bash
curl -X GET "https://localhost:5001/api/cart/user123" -k
```

### Aggiungere un articolo
```bash
curl -X POST "https://localhost:5001/api/cart/user123/items" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "productName": "Notebook Gaming",
    "price": 1299.99,
    "quantity": 2,
    "pictureUrl": "https://example.com/notebook.jpg",
    "brand": "ASUS",
    "type": "Laptop"
  }' -k
```

### Aggiornare quantità
```bash
curl -X PUT "https://localhost:5001/api/cart/user123/items/1" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}' -k
```

### Rimuovere articolo
```bash
curl -X DELETE "https://localhost:5001/api/cart/user123/items/1" -k
```

### Svuotare carrello
```bash
curl -X DELETE "https://localhost:5001/api/cart/user123" -k
```

## 🔄 Logica di Business

### Gestione Quantità
- Quando aggiungi un articolo già presente, la quantità viene sommata
- La quantità deve essere sempre >= 1
- Aggiornamento quantità sostituisce il valore esistente

### Persistenza Redis
- I carrelli sono salvati come JSON serializzato
- Scadenza automatica dopo 30 giorni di inattività
- Operazioni atomiche per garantire consistenza

### Gestione Errori
- Validazione input con Data Annotations
- Eccezioni tipizzate (`BadRequestException`, `NotFoundException`)
- Logging strutturato per debugging
- Responses HTTP standard

## 📊 Struttura Response

```json
{
  "id": "user123",
  "items": [
    {
      "productId": 1,
      "productName": "Notebook Gaming",
      "price": 1299.99,
      "quantity": 2,
      "pictureUrl": "https://example.com/notebook.jpg",
      "brand": "ASUS",
      "type": "Laptop"
    }
  ],
  "total": 2599.98,
  "totalItems": 2
}
```

## 🧪 Testing

Esegui il script di test PowerShell:
```powershell
.\test-cart-api.ps1
```

Oppure usa Swagger UI: `https://localhost:5001/swagger`

## 🔒 Sicurezza

- Validazione completa degli input
- Sanitizzazione automatica dei dati
- Gestione sicura delle eccezioni
- Timeout Redis per prevenire memory leak

## 🚀 Prestazioni

- **Redis**: Storage in-memory per performance elevate
- **Serializzazione JSON**: Ottimizzata per velocità
- **Connection Pooling**: Gestito da StackExchange.Redis
- **Scadenza automatica**: Previene accumulo dati obsoleti

## 📈 Monitoraggio

- Logging strutturato con Serilog
- Metriche per ogni operazione del carrello
- Tracciamento errori con context completo
- Health check Redis integrato
