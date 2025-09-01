import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../../core/services/cart.service';
import { BusyService } from '../../core/services/busy.service';
import { Cart, CartItem, CartTotals } from '../../shared/models/cart';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  cartTotals: CartTotals | null = null;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService, public busyService: BusyService) {}

  ngOnInit(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
      });

    this.cartService.cartTotal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(totals => {
        this.cartTotals = totals;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.busyService.setBusy();
    this.cartService.updateCartItemQuantity(productId, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.busyService.setIdle(),
        error: () => this.busyService.setIdle()
      });
  }

  removeItem(productId: number): void {
    this.busyService.setBusy();
    this.cartService.removeCartItem(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.busyService.setIdle(),
        error: () => this.busyService.setIdle()
      });
  }

  clearCart(): void {
    if (confirm('Sei sicuro di voler svuotare il carrello?')) {
      this.busyService.setBusy();
      this.cartService.clearCart()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.busyService.setIdle(),
          error: () => this.busyService.setIdle()
        });
    }
  }

  getItemSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  applyDiscount(discountCode: string): void {
    if (!discountCode?.trim()) {
      return;
    }

    this.busyService.setBusy();
    this.cartService.applyDiscount(discountCode.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.busyService.setIdle();
          // Mostra messaggio di successo
        },
        error: (error) => {
          this.busyService.setIdle();
          console.error('Error applying discount:', error);
          // Mostra messaggio di errore
        }
      });
  }
  
}
