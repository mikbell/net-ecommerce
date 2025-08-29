import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-cart',
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems$!: Observable<CartItem[]>;
  totalPrice: number = 0;
  totalItems: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartItems$ = this.cartService.getCartItems();
    
    this.cartItems$.subscribe(items => {
      this.totalPrice = this.cartService.getTotalPrice();
      this.totalItems = this.cartService.getTotalItems();
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  onQuantityChange(event: Event, productId: number): void {
    const target = event.target as HTMLInputElement;
    const quantity = parseInt(target.value, 10);
    if (quantity > 0) {
      this.updateQuantity(productId, quantity);
    }
  }
}
