# Testing Error Handling System

Questo documento descrive come testare il sistema completo di gestione errori del frontend Angular.

## Test di Navigazione alle Pagine di Errore

### Test 404 - Not Found
```bash
# 1. Avvia l'applicazione
ng serve

# 2. Naviga a URL inesistente nel browser
http://localhost:4200/pagina-inesistente
http://localhost:4200/shop/prodotto-inesistente
http://localhost:4200/user/12345

# Risultato atteso: Navigazione alla pagina 404 con animazioni e opzioni di ritorno
```

### Test 500 - Server Error
```bash
# 1. Spegni il backend ASP.NET Core
# 2. Cerca di aggiungere item al carrello o caricare prodotti
# 3. Fai richieste API che falliscono con 500

# Risultato atteso: Navigazione alla pagina 500 con opzioni di retry
```

### Test 403 - Forbidden
```bash
# Con il backend attivo, modifica temporaneamente un endpoint per restituire 403
# Oppure usa browser dev tools per simulare response 403

# Risultato atteso: Navigazione alla pagina 403 con messaggio di permessi
```

## Test Notifiche per Errori Non-Critici

### Test Errori Cart API
```bash
# 1. Backend attivo
# 2. Nella console browser esegui:
fetch('/api/cart/user-123', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
}).catch(err => console.log('Error handled by interceptor'));

# Risultato atteso: Notifica toast, NON navigazione a pagina errore
```

### Test Errori Products API
```bash
# 1. Naviga alla shop page
# 2. Spegni il backend temporaneamente
# 3. Applica filtri o cerca prodotti

# Risultato atteso: Notifica di errore, pagina rimane usabile
```

## Test Network Errors

### Test Offline Scenario
```bash
# 1. Applicazione avviata normalmente
# 2. Disconnetti internet
# 3. Naviga tra le pagine
# 4. Prova operazioni che richiedono API

# Risultato atteso: 
# - Retry automatico per richieste GET
# - Notifiche di errore connessione
# - Graceful degradation
```

## Test Validation Errors

### Test Form Validation
```javascript
// Nella console browser, simula validation error:
const mockValidationError = {
  status: 400,
  error: {
    statusCode: 400,
    message: 'Validation failed',
    errors: {
      email: ['Email is required', 'Invalid format'],
      password: ['Password too short']
    }
  }
};

// Triggera tramite una richiesta POST fallita
```

## Test Retry Mechanism

### Test Automatic Retry
```bash
# 1. Monitor network tab in browser dev tools
# 2. Spegni backend per 2-3 secondi
# 3. Fai richieste GET (es. load products)
# 4. Riaccendi backend

# Risultato atteso: Vedrai 2-3 tentativi di retry prima dell'errore finale
```

## Test Navigation Service

### Test Back Navigation
```javascript
// In console browser:

// Test quando NON c'è history
window.history.replaceState(null, '', '/error/not-found');
// Clicca "Torna Indietro" → dovrebbe andare alla home

// Test quando c'è history
window.history.pushState(null, '', '/shop');
window.history.pushState(null, '', '/error/not-found');
// Clicca "Torna Indietro" → dovrebbe tornare a /shop
```

## Test Error Interceptor Classification

### Test Critical vs Non-Critical URLs
```javascript
// In console browser:

// Test URL critico (dovrebbe navigare a error page)
fetch('/api/auth/login', { method: 'POST' })
  .catch(() => console.log('Should navigate to error page'));

// Test URL non-critico (dovrebbe mostrare solo notifica)  
fetch('/api/products/search?q=test')
  .catch(() => console.log('Should only show notification'));
```

## Automated Testing

### Unit Test Example per Error Service
```typescript
// error-handling.service.spec.ts
describe('ErrorHandlingService', () => {
  it('should handle 404 errors correctly', () => {
    const error = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found'
    });
    
    const userError = service.handleHttpError(error);
    expect(userError.type).toBe(ErrorType.NOT_FOUND);
    expect(userError.title).toBe('Risorsa non trovata');
  });
});
```

### E2E Test Example con Cypress
```javascript
// error-pages.cy.ts
describe('Error Pages', () => {
  it('should show 404 page for non-existent routes', () => {
    cy.visit('/non-existent-page');
    cy.contains('Pagina Non Trovata');
    cy.contains('404');
    cy.get('[data-cy=back-button]').should('be.visible');
  });

  it('should navigate back from error pages', () => {
    cy.visit('/shop');
    cy.visit('/non-existent-page');
    cy.get('[data-cy=back-button]').click();
    cy.url().should('include', '/shop');
  });
});
```

## Manual Testing Checklist

### Pagine di Errore
- [ ] 404: Design corretto, animazioni, pulsanti funzionanti
- [ ] 500: Dettagli tecnici espandibili, timestamp, retry funziona
- [ ] 403: Messaggio chiaro, opzioni di navigazione

### Notifiche
- [ ] Colori corretti per severità
- [ ] Posizionamento top-center
- [ ] Auto-dismiss tranne critici
- [ ] Testo chiaramente leggibile

### Navigation
- [ ] Back button appare solo quando c'è history
- [ ] Home button sempre funzionante
- [ ] Link rapidi alle sezioni principali

### Responsive Design
- [ ] Pagine errore mobile-friendly
- [ ] Notifiche leggibili su mobile
- [ ] Pulsanti facilmente clickabili su touch

### Performance
- [ ] Error pages caricano rapidamente
- [ ] Interceptor non rallenta richieste normali
- [ ] Retry logic non crea loop infiniti

## Debug Tips

### Browser DevTools
```javascript
// Abilita logging dettagliato
localStorage.setItem('debug', 'true');

// Monitora chiamate interceptor
// In Network tab, filtra per Failed requests

// Verifica stato error service
angular.getTestability(document.body).whenStable(() => {
  // Service injections debugging
});
```

### Console Commands
```javascript
// Test manuale navigazione
const navigationService = /* inject NavigationService */;
navigationService.goBack();
navigationService.goHome();

// Test manuale error handling
const errorService = /* inject ErrorHandlingService */;
errorService.showError({
  type: 'error',
  severity: 'error', 
  title: 'Test Error',
  message: 'This is a test'
});
```

## Common Issues & Solutions

### Issue: Pagina errore non appare
- **Check**: Verifica che l'interceptor sia registrato in app.config.ts
- **Check**: Route configurate correttamente
- **Check**: URL pattern nell'interceptor

### Issue: Notifiche non appaiono
- **Check**: MatSnackBarModule importato
- **Check**: CSS classes definite
- **Check**: Z-index conflicts

### Issue: Retry infinito
- **Check**: Retry count configurato correttamente
- **Check**: Condizioni di retry (solo GET, solo network/server errors)
- **Check**: Delay meccanismo funziona

### Issue: Back navigation non funziona
- **Check**: Browser history stato
- **Check**: NavigationService injected correttamente
- **Check**: Angular Router configurato
