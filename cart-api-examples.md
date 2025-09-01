# API del Carrello - Esempi di Utilizzo

L'API del carrello è stata implementata con Redis come storage per fornire prestazioni elevate e supporto per sessioni distribuite.

## Endpoints Disponibili

### 1. Ottenere un carrello
```
GET /api/cart/{id}
```
Restituisce il carrello con l'ID specificato. Se non esiste, ne crea uno vuoto.

**Esempio:**
```bash
curl -X GET "https://localhost:5001/api/cart/user123"
```

### 2. Aggiungere un articolo al carrello
```
POST /api/cart/{id}/items
Content-Type: application/json
```

**Body:**
```json
{
  "productId": 1,
  "productName": "Notebook HP",
  "price": 599.99,
  "quantity": 2,
  "pictureUrl": "https://example.com/hp-notebook.jpg",
  "brand": "HP",
  "type": "Laptop"
}
```

**Esempio:**
```bash
curl -X POST "https://localhost:5001/api/cart/user123/items" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "productName": "Notebook HP",
    "price": 599.99,
    "quantity": 2,
    "pictureUrl": "https://example.com/hp-notebook.jpg",
    "brand": "HP",
    "type": "Laptop"
  }'
```

### 3. Aggiornare la quantità di un articolo
```
PUT /api/cart/{id}/items/{productId}
Content-Type: application/json
```

**Body:**
```json
{
  "quantity": 5
}
```

**Esempio:**
```bash
curl -X PUT "https://localhost:5001/api/cart/user123/items/1" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

### 4. Rimuovere un articolo dal carrello
```
DELETE /api/cart/{id}/items/{productId}
```

**Esempio:**
```bash
curl -X DELETE "https://localhost:5001/api/cart/user123/items/1"
```

### 5. Svuotare completamente il carrello
```
DELETE /api/cart/{id}
```

**Esempio:**
```bash
curl -X DELETE "https://localhost:5001/api/cart/user123"
```

### 6. Sostituire completamente il carrello
```
POST /api/cart/{id}
Content-Type: application/json
```

**Body:**
```json
{
  "id": "user123",
  "items": [
    {
      "productId": 1,
      "productName": "Notebook HP",
      "price": 599.99,
      "quantity": 2,
      "pictureUrl": "https://example.com/hp-notebook.jpg",
      "brand": "HP",
      "type": "Laptop"
    },
    {
      "productId": 2,
      "productName": "Mouse Wireless",
      "price": 29.99,
      "quantity": 1,
      "pictureUrl": "https://example.com/mouse.jpg",
      "brand": "Logitech",
      "type": "Accessory"
    }
  ]
}
```

## Risposta del Carrello

Tutti gli endpoint che restituiscono il carrello forniscono una risposta nel seguente formato:

```json
{
  "id": "user123",
  "items": [
    {
      "productId": 1,
      "productName": "Notebook HP",
      "price": 599.99,
      "quantity": 2,
      "pictureUrl": "https://example.com/hp-notebook.jpg",
      "brand": "HP",
      "type": "Laptop"
    }
  ],
  "total": 1199.98,
  "totalItems": 2
}
```

## Caratteristiche

- **Persistenza Redis**: I carrelli sono salvati in Redis con scadenza di 30 giorni
- **Gestione automatica quantità**: Se aggiungi un articolo già presente, la quantità viene sommata
- **Validazione**: Tutti gli input sono validati per garantire consistenza
- **Gestione errori**: Errori dettagliati con codici HTTP appropriati
- **Logging**: Tutte le operazioni sono registrate per debugging
- **Calcolo automatico**: Total e TotalItems sono calcolati automaticamente

## Gestione degli ID

- L'ID del carrello può essere qualsiasi stringa (es. ID utente, GUID, session ID)
- Gli articoli sono identificati dall'ID del prodotto
- I carrelli vuoti non vengono salvati in Redis fino al primo articolo aggiunto

## Note di Sicurezza

- Validazione input per prevenire injection
- Gestione sicura delle eccezioni
- Timeout Redis configurato per evitare carrelli orfani
