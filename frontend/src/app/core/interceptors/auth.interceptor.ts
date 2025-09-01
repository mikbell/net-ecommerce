import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Aggiungi token se presente
    req = this.addTokenToRequest(req, this.authService.getToken());

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se errore 401 e non siamo già in refresh
        if (error.status === 401 && !this.isRefreshing) {
          return this.handle401Error(req, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (token) {
      return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
    }
    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Tenta di ottenere un nuovo token
      return this.authService.getCurrentUser().pipe(
        switchMap((user) => {
          this.isRefreshing = false;
          if (user && user.token) {
            this.refreshTokenSubject.next(user.token);
            return next.handle(this.addTokenToRequest(request, user.token));
          }
          
          // Se non riusciamo ad ottenere un nuovo token, logout
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Unable to refresh token'));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Se è già in corso un refresh, aspetta
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => next.handle(this.addTokenToRequest(request, this.authService.getToken())))
      );
    }
  }
}
