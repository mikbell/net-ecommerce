import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  private loadFeaturedProducts(): void {
    this.loading = true;
    this.productService.getProducts({ pageSize: 6 }).subscribe({
      next: (result) => {
        this.featuredProducts = result.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Errore nel caricamento dei prodotti in evidenza';
        this.loading = false;
        console.error('Error loading featured products:', error);
      }
    });
  }
}
