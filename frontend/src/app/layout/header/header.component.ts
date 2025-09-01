import { MatProgressBar } from '@angular/material/progress-bar';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BusyService } from '../../core/services/busy.service';
import { AuthService } from '../../core/services/auth.service';
import { CartSummaryComponent } from '../../shared/components/cart-summary/cart-summary.component';

@Component({
  selector: 'app-header',
  imports: [MatIcon, MatProgressBar, MatButtonModule, MatMenuModule, MatDividerModule, RouterLink, RouterLinkActive, CommonModule, CartSummaryComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  busyService = inject(BusyService);
  authService = inject(AuthService);
  
  logout(): void {
    this.authService.logout();
  }
  
  // Test method to trigger progress bar (remove in production)
  testProgressBar() {
    this.busyService.setBusy();
    setTimeout(() => {
      this.busyService.setIdle();
    }, 3000);
  }
}
