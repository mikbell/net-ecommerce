import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-forbidden',
  imports: [CommonModule, RouterModule],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class ForbiddenComponent {
  private navigationService = inject(NavigationService);

  goBack(): void {
    this.navigationService.goBack();
  }

  goHome(): void {
    this.navigationService.goHome();
  }

  get canGoBack(): boolean {
    return this.navigationService.canGoBack();
  }
}
