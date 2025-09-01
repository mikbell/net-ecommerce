import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
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
