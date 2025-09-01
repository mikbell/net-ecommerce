# Sistema di Gestione Errori Frontend

Il sistema di gestione errori è progettato per fornire un'esperienza utente coerente e professionale quando si verificano errori nell'applicazione Angular.

## Architettura

### 1. Error Interceptor (`error.interceptor.ts`)
- Intercetta automaticamente tutti gli errori HTTP
- Applica logica di retry per errori di rete
- Determina se navigare a pagine di errore dedicate o mostrare notifiche
- Gestisce la classificazione degli errori per criticità

### 2. Error Handling Service (`error-handling.service.ts`)
- Trasforma errori HTTP in messaggi user-friendly
- Gestisce diversi tipi di errore (validation, network, server, etc.)
- Fornisce metodi per navigazione programmatica alle pagine di errore
- Integra con MatSnackBar per notifiche

### 3. Navigation Service (`navigation.service.ts`)
- Fornisce utilities per navigazione
- Gestisce il back navigation intelligente
- Verifica se è possibile tornare indietro nella history

### 4. Error Pages (`features/error-pages/`)
- **404 Not Found**: Pagina non trovata
- **500 Server Error**: Errori del server
- **403 Forbidden**: Accesso negato

## Flusso di Gestione Errori

```
HTTP Error → Interceptor → Error Handling Service → Decision:
                                                    ├─ Critical → Navigate to Error Page
                                                    └─ Non-Critical → Show Notification
```

## Configurazione Criticità

### Errori Critici (navigano a pagine di errore)
- Errori di autenticazione (/api/auth/)
- Errori di profilo utente (/api/user/)
- Configurazione app (/api/config/)
- Altri errori non specificati (per sicurezza)

### Errori Non-Critici (mostrano solo notifiche)
- Errori prodotti (/api/products/)
- Errori carrello (/api/cart/)
- Errori ricerca (/api/search/)

## Tipi di Errore

### ErrorType enum
- `VALIDATION`: Errori di validazione form (400)
- `UNAUTHORIZED`: Non autorizzato (401)
- `FORBIDDEN`: Accesso negato (403)
- `NOT_FOUND`: Risorsa non trovata (404)
- `SERVER`: Errori server (5xx)
- `NETWORK`: Errori di connessione (status 0)
- `UNKNOWN`: Altri errori

### ErrorSeverity enum
- `INFO`: Informativo
- `WARNING`: Avviso
- `ERROR`: Errore standard
- `CRITICAL`: Errore critico (non auto-dismiss)

## Gestione Specifica per Tipo di Errore

### 401 Unauthorized
- Rimanda alla homepage (quando sarà implementata l'auth, andrà al login)
- Mostra notifica per richiedere login

### 403 Forbidden
- Naviga alla pagina 403 dedicata
- Offre opzioni per login o ritorno home

### 404 Not Found
- **Critici**: Naviga alla pagina 404
- **Non-critici**: Mostra solo notifica

### 500+ Server Errors
- Naviga alla pagina errore server dedicata
- Mostra dettagli tecnici se disponibili
- Opzioni per retry e supporto

### Network Errors (status 0)
- Mostra notifica di errore connessione
- Non naviga a pagina dedicata
- Applica retry automatico per richieste GET

## Pagine di Errore

### Caratteristiche Comuni
- Design moderno e responsivo
- Animazioni CSS per migliore UX
- Navigation intelligente (back button solo se history disponibile)
- Link rapidi a sezioni importanti dell'app
- Codici errore visibili per troubleshooting

### Not Found (404)
- Icona ricerca + numero 404
- Suggerimenti per navigazione
- Link a shop, about, homepage

### Server Error (500)
- Icona warning + codice status
- Dettagli tecnici espandibili
- Timestamp dell'errore
- Opzioni retry e contatto supporto

### Forbidden (403)
- Icona divieto + codice 403
- Messaggio su permessi
- Link per login quando sarà disponibile
- Navigazione al negozio

## Notifiche (MatSnackBar)

### Styling Classes
- `error-snackbar`: Errori standard (rosso)
- `warning-snackbar`: Warning (arancione)
- `info-snackbar`: Info (blu)
- `critical-snackbar`: Errori critici (rosso scuro)
- `success-snackbar`: Successo (verde)

### Posizionamento
- Top center per migliore visibilità
- Auto-dismiss tranne errori critici
- Durata configurabile per tipo

## Customizzazione

### Aggiungere URL Silenziosi
Nel `error.interceptor.ts`, aggiungere pattern nell'array `silentErrorUrls`:

```typescript
private silentErrorUrls: string[] = [
  '/api/analytics',  // Non mostrare errori per analytics
  '/api/tracking'    // Non mostrare errori per tracking
];
```

### Modificare Classificazione Criticità
Nel metodo `isCriticalResource()` dell'interceptor:

```typescript
const criticalPatterns = [
  '/api/auth/',      // Sempre critico
  '/api/payments/'   // Aggiungere nuovi pattern critici
];

const nonCriticalPatterns = [
  '/api/recommendations/', // Sempre non-critico
  '/api/statistics/'       // Aggiungere nuovi pattern non-critici
];
```

### Personalizzare Messaggi
Nel `error-handling.service.ts`, modificare l'oggetto `errorMessages`:

```typescript
private errorMessages = {
  400: {
    title: 'Titolo personalizzato',
    message: 'Messaggio personalizzato',
    type: ErrorType.VALIDATION
  }
  // ...
};
```

## Best Practices

1. **Errori Critici**: Solo per funzionalità core dell'app
2. **Retry Policy**: Solo per richieste GET e errori di rete/server
3. **User Experience**: Messaggi chiari e azioni suggerite
4. **Logging**: Tutti gli errori sono loggati in console per debug
5. **Responsive**: Tutte le pagine di errore sono mobile-friendly

## Testing

Per testare il sistema:

1. **Network Errors**: Disconnetti internet e ricarica
2. **404 Errors**: Naviga a route inesistente
3. **Server Errors**: Spegni il backend e usa l'app
4. **Validation Errors**: Invia form con dati non validi

## Estensioni Future

- Integrazione con servizio di monitoraggio errori (Sentry)
- Errori personalizzati per dominio business specifico
- Cache di errori per pattern ricorrenti
- Integrazione con sistema di feedback utenti
- Localizzazione messaggi di errore
