import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  ApiErrorResponse, 
  UserError, 
  ErrorType, 
  ErrorSeverity, 
  HttpErrorContext,
  ValidationErrorResponse 
} from '../../shared/models/error';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  // Global error state
  private currentErrorSubject = new BehaviorSubject<UserError | null>(null);
  public currentError$ = this.currentErrorSubject.asObservable();

  // Error mapping for common HTTP status codes
  private errorMessages: { [key: number]: { title: string; message: string; type: ErrorType } } = {
    400: {
      title: 'Richiesta non valida',
      message: 'I dati inviati non sono corretti. Verifica i campi e riprova.',
      type: ErrorType.VALIDATION
    },
    401: {
      title: 'Accesso negato',
      message: 'Devi effettuare il login per accedere a questa risorsa.',
      type: ErrorType.UNAUTHORIZED
    },
    403: {
      title: 'Permessi insufficienti',
      message: 'Non hai i permessi necessari per eseguire questa operazione.',
      type: ErrorType.FORBIDDEN
    },
    404: {
      title: 'Risorsa non trovata',
      message: 'La risorsa richiesta non è stata trovata.',
      type: ErrorType.NOT_FOUND
    },
    500: {
      title: 'Errore del server',
      message: 'Si è verificato un errore interno del server. Riprova più tardi.',
      type: ErrorType.SERVER
    },
    0: {
      title: 'Errore di connessione',
      message: 'Impossibile connettersi al server. Verifica la connessione internet.',
      type: ErrorType.NETWORK
    }
  };

  /**
   * Handle HTTP errors and convert them to user-friendly messages
   */
  handleHttpError(error: HttpErrorResponse, context?: Partial<HttpErrorContext>): UserError {
    console.error('HTTP Error:', error);

    const errorContext: HttpErrorContext = {
      statusCode: error.status,
      statusText: error.statusText,
      url: error.url || context?.url,
      method: context?.method,
      error: error.error
    };

    // Handle validation errors (400 with validation details)
    if (error.status === 400 && this.isValidationError(error.error)) {
      return this.handleValidationError(error.error as ValidationErrorResponse);
    }

    // Handle API errors with custom messages
    if (error.error && this.isApiErrorResponse(error.error)) {
      return this.handleApiError(error.error as ApiErrorResponse);
    }

    // Handle standard HTTP errors
    const errorConfig = this.errorMessages[error.status] || this.errorMessages[0];
    
    return {
      type: errorConfig.type,
      severity: this.getSeverityByStatus(error.status),
      title: errorConfig.title,
      message: error.error?.message || errorConfig.message,
      details: error.message,
      action: this.getActionByErrorType(errorConfig.type)
    };
  }

  /**
   * Handle validation errors with field-specific messages
   */
  private handleValidationError(validationError: ValidationErrorResponse): UserError {
    const fieldErrors = Object.entries(validationError.errors || {})
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.WARNING,
      title: 'Errori di validazione',
      message: validationError.message || 'Alcuni campi contengono errori.',
      details: fieldErrors,
      action: 'Correggi i campi evidenziati e riprova'
    };
  }

  /**
   * Handle API errors with custom messages from backend
   */
  private handleApiError(apiError: ApiErrorResponse): UserError {
    return {
      type: this.getErrorTypeByStatus(apiError.statusCode),
      severity: this.getSeverityByStatus(apiError.statusCode),
      title: this.getErrorTitleByStatus(apiError.statusCode),
      message: apiError.message,
      details: apiError.details,
      action: this.getActionByErrorType(this.getErrorTypeByStatus(apiError.statusCode))
    };
  }

  /**
   * Show error notification to user
   */
  showError(userError: UserError, duration: number = 5000): void {
    this.currentErrorSubject.next(userError);
    
    let snackBarClass = 'error-snackbar';
    switch (userError.severity) {
      case ErrorSeverity.WARNING:
        snackBarClass = 'warning-snackbar';
        break;
      case ErrorSeverity.INFO:
        snackBarClass = 'info-snackbar';
        break;
      case ErrorSeverity.CRITICAL:
        snackBarClass = 'critical-snackbar';
        duration = 0; // Don't auto-dismiss critical errors
        break;
    }

    this.snackBar.open(
      userError.message,
      userError.action || 'Chiudi',
      {
        duration: duration,
        panelClass: [snackBarClass],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(
      message,
      'Chiudi',
      {
        duration: duration,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Show info notification
   */
  showInfo(message: string, duration: number = 4000): void {
    this.snackBar.open(
      message,
      'OK',
      {
        duration: duration,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.currentErrorSubject.next(null);
  }

  /**
   * Handle specific error scenarios
   */
  handleUnauthorized(): void {
    // TODO: Redirect to login when auth is implemented
    this.router.navigate(['/']);
    this.showError({
      type: ErrorType.UNAUTHORIZED,
      severity: ErrorSeverity.ERROR,
      title: 'Accesso richiesto',
      message: 'Devi effettuare il login per continuare.',
      action: 'Accedi'
    });
  }

  handleNotFound(resource: string = 'risorsa'): void {
    this.showError({
      type: ErrorType.NOT_FOUND,
      severity: ErrorSeverity.ERROR,
      title: 'Non trovato',
      message: `La ${resource} richiesta non è stata trovata.`,
      action: 'Torna indietro'
    });
  }

  handleServerError(): void {
    this.showError({
      type: ErrorType.SERVER,
      severity: ErrorSeverity.CRITICAL,
      title: 'Errore del server',
      message: 'Si è verificato un problema tecnico. Il nostro team è stato notificato.',
      action: 'Riprova più tardi'
    });
  }

  handleNetworkError(): void {
    this.showError({
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.ERROR,
      title: 'Errore di connessione',
      message: 'Verifica la tua connessione internet e riprova.',
      action: 'Riprova'
    });
  }

  /**
   * Utility methods
   */
  private isApiErrorResponse(error: any): boolean {
    return error && 
           typeof error === 'object' && 
           typeof error.statusCode === 'number' && 
           typeof error.message === 'string';
  }

  private isValidationError(error: any): boolean {
    return this.isApiErrorResponse(error) && 
           error.errors && 
           typeof error.errors === 'object';
  }

  private getErrorTypeByStatus(status: number): ErrorType {
    switch (status) {
      case 400: return ErrorType.VALIDATION;
      case 401: return ErrorType.UNAUTHORIZED;
      case 403: return ErrorType.FORBIDDEN;
      case 404: return ErrorType.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504: return ErrorType.SERVER;
      case 0: return ErrorType.NETWORK;
      default: return ErrorType.UNKNOWN;
    }
  }

  private getSeverityByStatus(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.CRITICAL;
    if (status >= 400) return ErrorSeverity.ERROR;
    if (status >= 300) return ErrorSeverity.WARNING;
    return ErrorSeverity.INFO;
  }

  private getErrorTitleByStatus(status: number): string {
    return this.errorMessages[status]?.title || 'Errore sconosciuto';
  }

  private getActionByErrorType(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK: return 'Riprova';
      case ErrorType.NOT_FOUND: return 'Torna indietro';
      case ErrorType.UNAUTHORIZED: return 'Accedi';
      case ErrorType.FORBIDDEN: return 'Contatta supporto';
      case ErrorType.VALIDATION: return 'Correggi errori';
      case ErrorType.SERVER: return 'Riprova più tardi';
      default: return 'Chiudi';
    }
  }
}
