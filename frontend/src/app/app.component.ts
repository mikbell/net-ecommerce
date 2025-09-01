import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'NetShop';
  private router = inject(Router);
  
  isErrorPage = false;
  
  ngOnInit() {
    // Listen to route changes to detect error pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      this.isErrorPage = event.url.startsWith('/error/');
    });
    
    // Check initial route
    this.isErrorPage = this.router.url.startsWith('/error/');
  }
}
