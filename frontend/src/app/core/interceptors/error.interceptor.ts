import { Injectable, inject } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ErrorHandlingService } from '../services/error-handling.service';
import { ErrorType } from '../../shared/models/error';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorHandlingService = inject(ErrorHandlingService);
  
  // URLs that should not show global error notifications
  private silentErrorUrls: string[] = [
    // Add URLs here that should handle errors locally
  ];

  // HTTP methods that should be retried on network errors
  private retryableMethods: string[] = ['GET'];
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      // Retry network errors for safe methods
      retry({
        count: this.shouldRetry(request) ? 2 : 0,
        delay: (error: HttpErrorResponse) => {
          // Only retry on network errors
          if (error.status === 0 || error.status >= 500) {
            return new Promise(resolve => setTimeout(resolve, 1000));
          }
          throw error;
        }
      }),
      
      catchError((error: HttpErrorResponse) => {
        // Check if this URL should handle errors silently
        const shouldShowGlobalError = !this.silentErrorUrls.some(url => 
          request.url.includes(url)
        );

        if (shouldShowGlobalError) {
          const userError = this.errorHandlingService.handleHttpError(error, {
            url: request.url,
            method: request.method
          });

          // Handle specific error types
          switch (userError.type) {
            case ErrorType.UNAUTHORIZED:
              this.errorHandlingService.handleUnauthorized();
              break;
              
            case ErrorType.NOT_FOUND:
              // Don't show global notification for 404s, let components handle them
              break;
              
            case ErrorType.SERVER:
              this.errorHandlingService.handleServerError();
              break;
              
            case ErrorType.NETWORK:
              this.errorHandlingService.handleNetworkError();
              break;
              
            default:
              // Show the error for other types
              this.errorHandlingService.showError(userError);
          }
        }

        // Always rethrow the error so components can handle it if needed
        return throwError(() => error);
      })
    );
  }

  private shouldRetry(request: HttpRequest<any>): boolean {
    return this.retryableMethods.includes(request.method.toUpperCase());
  }
}
