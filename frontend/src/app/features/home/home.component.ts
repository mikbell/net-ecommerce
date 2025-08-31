import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { BusyService } from '../../core/services/busy.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { ShopParams } from '../../shared/models/shopParams';
import { UserError } from '../../shared/models/error';
import { ErrorDisplayComponent } from '../../shared/components/error-display/error-display.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ErrorDisplayComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private shopService = inject(ShopService);
  private busyService = inject(BusyService);
  private errorHandlingService = inject(ErrorHandlingService);

  featuredProducts: Product[] = [];
  error: UserError | null = null;
  
  // Hero section data
  heroData = {
    title: 'Scopri il Meglio dello Shopping Online',
    subtitle: 'Prodotti di qualità, prezzi competitivi e consegna veloce. La tua esperienza di acquisto inizia qui.',
    ctaText: 'Esplora il Catalogo',
    ctaSecondary: 'Offerte Speciali',
  };

  // Statistics for hero section
  stats = [
    { label: 'Prodotti', value: '500+', icon: 'inventory' },
    { label: 'Clienti Soddisfatti', value: '1000+', icon: 'people' },
    { label: 'Consegna Veloce', value: '24h', icon: 'local_shipping' },
    { label: 'Garanzia', value: '100%', icon: 'verified' }
  ];

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  private loadFeaturedProducts(): void {
    this.error = null;

    // Load first 8 products as featured products
    const shopParams = new ShopParams();
    shopParams.pageSize = 8;
    shopParams.pageIndex = 1;
    shopParams.sort = 'nameasc'; // Or any default sort

    // The busy state will be handled automatically by the busyInterceptor
    this.shopService.getProducts(shopParams).subscribe({
      next: (response) => {
        this.featuredProducts = response.data;
        console.log(`Loaded ${this.featuredProducts.length} featured products`);
      },
      error: (httpError) => {
        this.error = this.errorHandlingService.handleHttpError(httpError, {
          url: '/products',
          method: 'GET'
        });
        console.error('Error loading featured products:', httpError);
      }
    });
  }

  onRetryLoadProducts(): void {
    this.loadFeaturedProducts();
  }

  onErrorDismiss(): void {
    this.error = null;
  }

  onErrorAction(action: string): void {
    switch (action) {
      case 'Riprova':
        this.onRetryLoadProducts();
        break;
      default:
        this.onErrorDismiss();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getDiscountedPrice(product: Product): number | null {
    if (product.originalPrice && product.originalPrice > product.price) {
      return product.originalPrice;
    }
    return null;
  }

  scrollToProducts(): void {
    const element = document.getElementById('featured-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
