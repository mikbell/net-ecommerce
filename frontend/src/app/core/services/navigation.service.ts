import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  private location = inject(Location);

  /**
   * Navigate back to the previous page if history exists, otherwise go to home
   */
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate to a specific route
   */
  navigateTo(route: string[]): void {
    this.router.navigate(route);
  }

  /**
   * Reload the current page
   */
  reload(): void {
    window.location.reload();
  }

  /**
   * Check if we can go back in browser history
   */
  canGoBack(): boolean {
    return window.history.length > 1;
  }

  /**
   * Get the current route
   */
  getCurrentRoute(): string {
    return this.router.url;
  }

  /**
   * Check if current route matches a pattern
   */
  isCurrentRoute(pattern: string): boolean {
    return this.router.url.includes(pattern);
  }
}
