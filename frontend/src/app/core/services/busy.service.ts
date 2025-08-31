import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  private busyRequestCount = 0;
  private busySubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * Observable that emits the current busy state
   */
  get isBusy$(): Observable<boolean> {
    return this.busySubject.asObservable();
  }

  /**
   * Get the current busy state synchronously
   */
  get isBusy(): boolean {
    return this.busySubject.value;
  }

  /**
   * Increment the busy request counter and set busy state to true
   */
  setBusy(): void {
    this.busyRequestCount++;
    if (this.busyRequestCount === 1) {
      this.busySubject.next(true);
    }
  }

  /**
   * Decrement the busy request counter and set busy state to false when no pending requests
   */
  setIdle(): void {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.busySubject.next(false);
    }
  }

  /**
   * Force set busy state (useful for manual operations)
   */
  setBusyState(busy: boolean): void {
    if (busy) {
      this.setBusy();
    } else {
      this.setIdle();
    }
  }

  /**
   * Reset busy state to idle (useful for error handling)
   */
  reset(): void {
    this.busyRequestCount = 0;
    this.busySubject.next(false);
  }

  /**
   * Execute an async operation while tracking busy state
   */
  async executeWithBusy<T>(operation: () => Promise<T>): Promise<T> {
    this.setBusy();
    try {
      return await operation();
    } finally {
      this.setIdle();
    }
  }

  /**
   * Wrap an Observable to track busy state
   */
  wrapObservable<T>(observable: Observable<T>): Observable<T> {
    this.setBusy();
    return new Observable(subscriber => {
      const subscription = observable.subscribe({
        next: value => subscriber.next(value),
        error: error => {
          this.setIdle();
          subscriber.error(error);
        },
        complete: () => {
          this.setIdle();
          subscriber.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }
}
