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
              
            case ErrorType.FORBIDDEN:
              // Navigate to forbidden page for 403 errors
              this.errorHandlingService.handleForbidden(true);
              break;
              
            case ErrorType.NOT_FOUND:
              // For API calls that result in 404, we might want to show a notification
              // but not navigate to error page (components can handle this locally)
              // Only navigate to error page if it's a critical resource
              if (this.isCriticalResource(request.url)) {
                this.errorHandlingService.handleNotFound('risorsa', true);
              } else {
                this.errorHandlingService.handleNotFound('risorsa', false);
              }
              break;
              
            case ErrorType.SERVER:
              // Navigate to server error page for 5xx errors
              this.errorHandlingService.handleServerError(true);
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

  /**
   * Determine if a resource is critical enough to warrant navigating to an error page
   * vs just showing a notification. Critical resources are typically:
   * - Main page/navigation requests
   * - Authentication requests
   * - Core app functionality
   */
  private isCriticalResource(url: string): boolean {
    // Examples of critical resources:
    const criticalPatterns = [
      '/api/auth/',      // Authentication endpoints
      '/api/user/',      // User profile endpoints
      '/api/config/',    // App configuration
    ];
    
    // Non-critical resources that should show notifications only:
    const nonCriticalPatterns = [
      '/api/products/',  // Product listings - show notification
      '/api/cart/',      // Cart operations - show notification
      '/api/search/',    // Search results - show notification
    ];
    
    // Check if it's explicitly non-critical first
    if (nonCriticalPatterns.some(pattern => url.includes(pattern))) {
      return false;
    }
    
    // Check if it's explicitly critical
    if (criticalPatterns.some(pattern => url.includes(pattern))) {
      return true;
    }
    
    // Default: consider it critical to be safe
    return true;
  }
}
