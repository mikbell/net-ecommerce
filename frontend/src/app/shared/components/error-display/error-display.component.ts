import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { UserError, ErrorType, ErrorSeverity } from '../../models/error';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss']
})
export class ErrorDisplayComponent implements OnInit {
  @Input() error: UserError | null = null;
  @Input() showDetails: boolean = false;
  @Input() showActions: boolean = true;
  @Input() centerLayout: boolean = false;
  @Input() compact: boolean = false;
  
  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();
  @Output() action = new EventEmitter<string>();

  // Expose enums to template
  ErrorType = ErrorType;
  ErrorSeverity = ErrorSeverity;

  ngOnInit(): void {
    // Auto-dismiss info messages after a delay
    if (this.error?.severity === ErrorSeverity.INFO) {
      setTimeout(() => this.onDismiss(), 5000);
    }
  }

  getErrorIcon(): string {
    if (!this.error) return 'error';
    
    switch (this.error.type) {
      case ErrorType.NETWORK:
        return 'wifi_off';
      case ErrorType.NOT_FOUND:
        return 'search_off';
      case ErrorType.UNAUTHORIZED:
        return 'lock';
      case ErrorType.FORBIDDEN:
        return 'block';
      case ErrorType.VALIDATION:
        return 'warning';
      case ErrorType.SERVER:
        return 'error_outline';
      default:
        return 'error';
    }
  }

  getSeverityClass(): string {
    if (!this.error) return '';
    
    switch (this.error.severity) {
      case ErrorSeverity.INFO:
        return 'info';
      case ErrorSeverity.WARNING:
        return 'warning';
      case ErrorSeverity.ERROR:
        return 'error';
      case ErrorSeverity.CRITICAL:
        return 'critical';
      default:
        return 'error';
    }
  }

  getErrorColorClass(): string {
    if (!this.error) return 'error-color';
    
    switch (this.error.severity) {
      case ErrorSeverity.INFO:
        return 'info-color';
      case ErrorSeverity.WARNING:
        return 'warning-color';
      case ErrorSeverity.ERROR:
        return 'error-color';
      case ErrorSeverity.CRITICAL:
        return 'critical-color';
      default:
        return 'error-color';
    }
  }

  canRetry(): boolean {
    if (!this.error) return false;
    
    return this.error.type === ErrorType.NETWORK || 
           this.error.type === ErrorType.SERVER;
  }

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }

  onAction(): void {
    if (this.error?.action) {
      this.action.emit(this.error.action);
    }
  }

  getButtonVariant(): string {
    if (!this.error) return 'raised';
    
    switch (this.error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'raised';
      case ErrorSeverity.ERROR:
        return 'raised';
      default:
        return 'stroked';
    }
  }
}
