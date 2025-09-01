import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { Cart } from '../../models/cart';

@Component({
  selector: 'app-cart-summary',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss'
})
export class CartSummaryComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTotalItems(): number {
    return this.cart?.totalItems || 0;
  }

  getTotal(): number {
    return this.cart?.total || 0;
  }
}
