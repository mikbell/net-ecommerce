import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../../shared/models/product';
import { ShopService } from '../../../core/services/shop.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private snackBar = inject(MatSnackBar);

  product: Product | null = null;
  quantity: number = 1;
  isLoading = true;
  error: string | null = null;
  maxQuantity = 10; // Default max quantity

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID prodotto non valido';
      this.isLoading = false;
      return;
    }

    const productId = parseInt(id, 10);
    
    if (isNaN(productId) || productId <= 0) {
      this.error = 'ID prodotto non valido';
      this.isLoading = false;
      return;
    }

    this.shopService.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.maxQuantity = Math.min(product.quantityInStock, 10);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Prodotto non trovato';
        this.isLoading = false;
      }
    });
  }

  onQuantityChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= this.maxQuantity) {
      this.quantity = value;
    } else {
      this.quantity = Math.max(1, Math.min(value, this.maxQuantity));
      event.target.value = this.quantity;
    }
  }

  increaseQuantity(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    // TODO: Implement cart service when available
    // For now, just show a success message
    this.snackBar.open(
      `${this.product.name} (${this.quantity}) aggiunto al carrello!`,
      'Chiudi',
      { duration: 3000 }
    );
  }

  onBackClick(): void {
    this.router.navigate(['/shop']);
  }

  isInStock(): boolean {
    return this.product ? this.product.quantityInStock > 0 : false;
  }

  getStockStatusText(): string {
    if (!this.product) return '';
    
    if (this.product.quantityInStock === 0) {
      return 'Esaurito';
    } else if (this.product.quantityInStock < 5) {
      return `Solo ${this.product.quantityInStock} disponibili`;
    }
    return 'Disponibile';
  }

  getStockStatusClass(): string {
    if (!this.product) return '';
    
    if (this.product.quantityInStock === 0) {
      return 'out-of-stock';
    } else if (this.product.quantityInStock < 5) {
      return 'low-stock';
    }
    return 'in-stock';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}
