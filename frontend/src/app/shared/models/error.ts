// Base error interface
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp?: string;
}

// API Error Response interface (matches backend ApiResponse)
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  details?: string;
  errors?: { [key: string]: string[] };
}

// Validation Error Response interface
export interface ValidationErrorResponse extends ApiErrorResponse {
  errors: { [key: string]: string[] };
}

// Error types enum
export enum ErrorType {
  NETWORK = 'NETWORK',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Error severity enum
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// User-friendly error interface
export interface UserError {
  type: ErrorType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  action?: string;
  details?: string;
}

// HTTP Error context
export interface HttpErrorContext {
  url?: string;
  method?: string;
  statusCode: number;
  statusText?: string;
  error?: any;
}
