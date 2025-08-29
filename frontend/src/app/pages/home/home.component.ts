import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-home',
    imports: [RouterModule, ProductCardComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(products => {
      // Mostra solo i primi 4 prodotti come featured
      this.featuredProducts = products.slice(0, 4);
    });
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(product);
    // Qui potresti aggiungere un toast notification
  }
}
