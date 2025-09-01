import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-server-error',
  imports: [CommonModule, RouterModule],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent implements OnInit {
  error: any;
  private router = inject(Router);
  private navigationService = inject(NavigationService);

  constructor() {
    const navigationState = this.router.getCurrentNavigation()?.extras?.state;
    if (navigationState) {
      this.error = navigationState['error'];
    }
  }

  ngOnInit(): void {
    // Se non c'è errore passato via navigazione, mostra errore generico
    if (!this.error) {
      this.error = {
        status: 500,
        message: 'Errore interno del server',
        details: 'Si è verificato un errore interno. Il nostro team è già al lavoro per risolverlo.'
      };
    }
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  goHome(): void {
    this.navigationService.goHome();
  }

  reload(): void {
    this.navigationService.reload();
  }

  get canGoBack(): boolean {
    return this.navigationService.canGoBack();
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString('it-IT');
  }
}
