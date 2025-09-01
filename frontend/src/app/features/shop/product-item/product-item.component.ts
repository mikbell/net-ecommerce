import { Component, Input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AddCartItem } from '../../../shared/models/cart';

@Component({
  selector: 'app-product-item',
  imports: [MatIcon, MatIconButton, CurrencyPipe, RouterLink, CommonModule],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss',
})
export class ProductItemComponent {
  @Input() product?: Product;
  isAddingToCart = false;

  constructor(private cartService: CartService) {}

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.product || this.isAddingToCart) {
      return;
    }

    const cartItem: AddCartItem = {
      productId: this.product.id,
      productName: this.product.name,
      price: this.product.price,
      quantity: 1,
      pictureUrl: this.product.pictureUrl,
      brand: this.product.brand || '',
      type: this.product.type || ''
    };

    this.isAddingToCart = true;
    this.cartService.addItemToCart(cartItem).subscribe({
      next: () => {
        this.isAddingToCart = false;
        // Eventualmente mostrare una notifica di successo
      },
      error: () => {
        this.isAddingToCart = false;
        // Eventualmente mostrare una notifica di errore
      }
    });
  }

  isInCart(): boolean {
    return this.product ? this.cartService.isProductInCart(this.product.id) : false;
  }

  getQuantityInCart(): number {
    return this.product ? this.cartService.getProductQuantityInCart(this.product.id) : 0;
  }
}
