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
import { CartService } from '../../../core/services/cart.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { UserError, ErrorType, ErrorSeverity } from '../../../shared/models/error';
import { AddCartItem } from '../../../shared/models/cart';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';

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
    MatSnackBarModule,
    ErrorDisplayComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private errorHandlingService = inject(ErrorHandlingService);

  product: Product | null = null;
  quantity: number = 1;
  isLoading = true;
  error: UserError | null = null;
  maxQuantity = 10; // Default max quantity
  retryCount = 0;
  maxRetries = 3;
  isAddingToCart = false;

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.handleInvalidId('ID mancante');
      return;
    }

    const productId = parseInt(id, 10);
    
    if (isNaN(productId) || productId <= 0) {
      this.handleInvalidId('ID non valido');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.shopService.getProduct(productId).subscribe({
      next: (product) => {
        this.handleProductLoaded(product);
      },
      error: (httpError) => {
        this.handleLoadError(httpError, productId);
      }
    });
  }

  private handleInvalidId(details: string): void {
    this.error = {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.ERROR,
      title: 'Prodotto non valido',
      message: 'L\'ID del prodotto specificato non è valido.',
      details: details,
      action: 'Torna al catalogo'
    };
    this.isLoading = false;
  }

  private handleProductLoaded(product: Product): void {
    this.product = product;
    this.maxQuantity = Math.min(product.quantityInStock, 10);
    this.error = null;
    this.isLoading = false;
    this.retryCount = 0;
    
    // Log successful load for analytics
    console.log(`Product loaded successfully: ${product.name} (ID: ${product.id})`);
  }

  private handleLoadError(httpError: any, productId: number): void {
    this.isLoading = false;
    
    const userError = this.errorHandlingService.handleHttpError(httpError, {
      url: `/products/${productId}`,
      method: 'GET'
    });

    // Customize error message for product context
    if (httpError.status === 404) {
      this.error = {
        ...userError,
        title: 'Prodotto non trovato',
        message: 'Il prodotto che stai cercando non esiste o non è più disponibile.',
        action: 'Vai al catalogo'
      };
    } else if (httpError.status === 0) {
      this.error = {
        ...userError,
        title: 'Errore di connessione',
        message: 'Impossibile caricare i dettagli del prodotto. Controlla la connessione internet.',
        action: 'Riprova'
      };
    } else {
      this.error = userError;
    }
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
    if (!this.product || this.isAddingToCart) {
      return;
    }

    const cartItem: AddCartItem = {
      productId: this.product.id,
      productName: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      pictureUrl: this.product.pictureUrl,
      brand: this.product.brand || '',
      type: this.product.type || ''
    };

    this.isAddingToCart = true;
    this.cartService.addItemToCart(cartItem).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.snackBar.open(
          `${this.product!.name} (${this.quantity}) aggiunto al carrello!`,
          'Chiudi',
          { duration: 3000 }
        );
        // Reset quantity to 1 after successful add
        this.quantity = 1;
      },
      error: (error) => {
        this.isAddingToCart = false;
        console.error('Error adding item to cart:', error);
        this.snackBar.open(
          'Errore durante l\'aggiunta al carrello. Riprova.',
          'Chiudi',
          { duration: 3000 }
        );
      }
    });
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

  // Error handling action methods
  onRetryClick(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying product load (attempt ${this.retryCount}/${this.maxRetries})`);
      this.loadProduct();
    } else {
      this.errorHandlingService.showError({
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.ERROR,
        title: 'Troppi tentativi',
        message: 'Massimo numero di tentativi raggiunto. Riprova più tardi.',
        action: 'Torna al catalogo'
      });
    }
  }

  onErrorDismiss(): void {
    this.error = null;
  }

  onErrorAction(action: string): void {
    switch (action) {
      case 'Riprova':
        this.onRetryClick();
        break;
      case 'Torna al catalogo':
      case 'Vai al catalogo':
        this.router.navigate(['/shop']);
        break;
      default:
        this.onErrorDismiss();
    }
  }

  // Cart helper methods
  isInCart(): boolean {
    return this.product ? this.cartService.isProductInCart(this.product.id) : false;
  }

  getQuantityInCart(): number {
    return this.product ? this.cartService.getProductQuantityInCart(this.product.id) : 0;
  }
}
