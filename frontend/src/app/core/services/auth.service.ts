import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, throwError } from 'rxjs';
import { User, LoginRequest, RegisterRequest, UserProfile, UpdateProfileRequest, ChangePasswordRequest, AuthState } from '../../shared/models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/account`;
  private readonly TOKEN_KEY = 'ecommerce_token';
  private readonly USER_KEY = 'ecommerce_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Getters per comodità
  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get isLoading(): boolean {
    return this.authStateSubject.value.isLoading;
  }

  // Carica utente da localStorage se presente
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        if (this.isTokenValid(token)) {
          this.updateAuthState({ user, isAuthenticated: true, isLoading: false });
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  // Verifica se il token è ancora valido (controllo base scadenza)
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Aggiorna stato autenticazione
  private updateAuthState(newState: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...newState });
  }

  // Salva user e token nel localStorage
  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Rimuove user e token dal localStorage
  private removeUserFromStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Login
  login(loginRequest: LoginRequest): Observable<User> {
    this.updateAuthState({ isLoading: true });
    
    return this.http.post<User>(`${this.API_URL}/login`, loginRequest).pipe(
      tap(user => {
        this.saveUserToStorage(user);
        this.updateAuthState({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      }),
      catchError(error => {
        this.updateAuthState({ isLoading: false });
        return throwError(() => error);
      })
    );
  }

  // Registrazione
  register(registerRequest: RegisterRequest): Observable<User> {
    this.updateAuthState({ isLoading: true });
    
    return this.http.post<User>(`${this.API_URL}/register`, registerRequest).pipe(
      tap(user => {
        this.saveUserToStorage(user);
        this.updateAuthState({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      }),
      catchError(error => {
        this.updateAuthState({ isLoading: false });
        return throwError(() => error);
      })
    );
  }

  // Logout
  logout(): void {
    this.removeUserFromStorage();
    this.updateAuthState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  }

  // Ottieni utente corrente (refresh token)
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/current-user`).pipe(
      tap(user => {
        this.saveUserToStorage(user);
        this.updateAuthState({ user });
      })
    );
  }

  // Ottieni profilo utente completo
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/profile`);
  }

  // Aggiorna profilo utente
  updateProfile(updateRequest: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_URL}/profile`, updateRequest);
  }

  // Cambia password
  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, changePasswordRequest);
  }

  // Verifica se email esiste
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/email-exists?email=${email}`);
  }

  // Ottieni token corrente
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Verifica se utente è autenticato (observable)
  isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(map(state => state.isAuthenticated));
  }

  // Ottieni utente corrente (observable)
  currentUser$(): Observable<User | null> {
    return this.authState$.pipe(map(state => state.user));
  }
}
