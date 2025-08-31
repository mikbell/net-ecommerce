import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BusyService } from '../../../core/services/busy.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-busy-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="test-card">
      <mat-card-header>
        <mat-card-title>BusyService Test Component</mat-card-title>
        <mat-card-subtitle>Test the global loading state</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="status-section">
          <p><strong>Busy State:</strong> {{ (busyService.isBusy$ | async) ? 'BUSY' : 'IDLE' }}</p>
          <div class="visual-indicator" [class.busy]="busyService.isBusy$ | async">
            {{ (busyService.isBusy$ | async) ? 'Loading...' : 'Ready' }}
          </div>
        </div>
        
        <div class="test-buttons">
          <button mat-raised-button color="primary" (click)="testManualBusy()">
            Test Manual Busy (3s)
          </button>
          
          <button mat-raised-button color="accent" (click)="testHttpRequest()">
            Test HTTP Request
          </button>
          
          <button mat-raised-button (click)="testAsyncOperation()">
            Test Async Operation
          </button>
          
          <button mat-raised-button color="warn" (click)="resetBusyState()">
            Reset State
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-card {
      margin: 2rem;
      max-width: 600px;
    }
    
    .status-section {
      padding: 1rem 0;
      text-align: center;
    }
    
    .visual-indicator {
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 8px;
      background: #e8f5e8;
      color: #2e7d32;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    
    .visual-indicator.busy {
      background: #fff3e0;
      color: #f57c00;
      animation: pulse 1.5s ease-in-out infinite alternate;
    }
    
    @keyframes pulse {
      from { opacity: 1; }
      to { opacity: 0.6; }
    }
    
    .test-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }
    
    .test-buttons button {
      min-width: 150px;
    }
  `]
})
export class BusyTestComponent {
  public busyService = inject(BusyService);
  private http = inject(HttpClient);

  testManualBusy(): void {
    console.log('Testing manual busy state...');
    this.busyService.setBusy();
    
    setTimeout(() => {
      this.busyService.setIdle();
      console.log('Manual busy test completed');
    }, 3000);
  }

  testHttpRequest(): void {
    console.log('Testing HTTP request busy state...');
    // This will trigger the busyInterceptor
    this.http.get('https://jsonplaceholder.typicode.com/posts/1')
      .pipe(delay(1000)) // Add some delay to see the loading
      .subscribe({
        next: (data) => console.log('HTTP request completed:', data),
        error: (error) => console.error('HTTP request failed:', error)
      });
  }

  testAsyncOperation(): void {
    console.log('Testing async operation with BusyService wrapper...');
    
    const asyncOperation = async (): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Async operation completed successfully');
        }, 2000);
      });
    };

    this.busyService.executeWithBusy(asyncOperation)
      .then(result => console.log(result))
      .catch(error => console.error('Async operation failed:', error));
  }

  resetBusyState(): void {
    console.log('Resetting busy state...');
    this.busyService.reset();
  }
}
