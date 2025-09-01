# ASP.NET Identity Implementation

## Overview
È stata implementata l'autenticazione completa con ASP.NET Identity e JWT Bearer tokens per l'API e-commerce.

## Features Implemented

### 1. Identity Setup
- **AppUser Entity**: Estende `IdentityUser` con campi aggiuntivi per profilo utente (nome, cognome, indirizzo, etc.)
- **StoreContext**: Aggiornato per estendere `IdentityDbContext<AppUser>`
- **Database Migration**: Creata migration `IdentityTables` che aggiunge tutte le tabelle ASP.NET Identity

### 2. JWT Authentication
- **TokenService**: Implementa `ITokenService` per generazione JWT tokens
- **JWT Configuration**: Configurato in `appsettings.json` con chiave sicura e issuer
- **Token Validation**: Configurata validazione JWT con signing key, issuer e lifetime

### 3. API Endpoints (AccountController)

#### Registration
- `POST /api/account/register`
- Input: `RegisterDto` (email, password, firstName, lastName)
- Output: `UserDto` con JWT token

#### Login
- `POST /api/account/login`
- Input: `LoginDto` (email, password)
- Output: `UserDto` con JWT token
- Tracking: Aggiorna `LastLoginAt` timestamp

#### Profile Management
- `GET /api/account/profile` - Ottieni profilo utente (richiede auth)
- `PUT /api/account/profile` - Aggiorna profilo (richiede auth)
- Input: `UpdateProfileDto` con campi opzionali del profilo

#### Password Management
- `POST /api/account/change-password` - Cambia password (richiede auth)
- Input: `ChangePasswordDto` (password corrente e nuova)

#### Utility Endpoints
- `GET /api/account/email-exists?email={email}` - Verifica se email esiste
- `GET /api/account/current-user` - Ottieni utente corrente con nuovo token (richiede auth)

### 4. Security Configuration

#### Identity Options
- Password: lunghezza minima 6, richiede digit, uppercase, lowercase
- User: email univoca richiesta
- SignIn: email confirmation disabilitata per development

#### JWT Settings
```json
"Token": {
  "Key": "this is my custom Secret key for authentication which needs to be very long for security",
  "Issuer": "https://localhost:7001"
}
```

#### JWT Claims
- Email (ClaimTypes.Email)
- Nome (ClaimTypes.GivenName) 
- Cognome (ClaimTypes.Surname)
- User ID (ClaimTypes.NameIdentifier)
- Roles (ClaimTypes.Role) - future implementation

### 5. Swagger Integration
- JWT Bearer authentication configurato in Swagger UI
- Header di autorizzazione: `Bearer {token}`
- Pulsante "Authorize" disponibile per testare endpoints protetti

### 6. Database Seeding
Due utenti di default vengono creati:

#### Admin User
- Email: `admin@test.com`
- Password: `Password123!`
- Nome: Admin User
- Indirizzo completo con Milano

#### Regular User
- Email: `user@test.com` 
- Password: `Password123!`
- Nome: Test User
- Indirizzo completo con Roma

### 7. Error Handling
- Validazione input con Data Annotations
- Risposte API standardizzate con `ApiResponse`
- Gestione errori Identity con messaggi specifici
- Controlli di sicurezza (account attivo, email confirmed, etc.)

## Usage Examples

### Registration
```http
POST /api/account/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "MyPassword123!",
  "firstName": "Mario",
  "lastName": "Rossi"
}
```

### Login
```http
POST /api/account/login
Content-Type: application/json

{
  "email": "user@test.com",
  "password": "Password123!"
}
```

### Authenticated Request
```http
GET /api/account/profile
Authorization: Bearer {your-jwt-token}
```

## Security Considerations
- JWT tokens scadono dopo 7 giorni
- Password policy implementata
- CORS configurato per origini specifiche
- HTTPS raccomandato in produzione
- Chiavi JWT devono essere cambiate in produzione

## Next Steps
- Implementazione ruoli e autorizzazioni
- Email confirmation workflow
- Password reset functionality  
- Refresh tokens per sicurezza migliorata
- Rate limiting sui login attempts
