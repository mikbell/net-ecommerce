import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductParams, PagedResult, ProductFilters } from '../../models/product.model';

@Component({
    selector: 'app-products',
    imports: [FormsModule, ProductCardComponent],
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  pagedResult?: PagedResult<Product>;
  filters?: ProductFilters;
  
  // Parametri di ricerca
  currentParams: ProductParams = {
    pageIndex: 1,
    pageSize: 12
  };
  
  selectedBrand: string = '';
  selectedType: string = '';
  selectedSort: string = '';
  searchTerm: string = '';
  
  loading: boolean = false;
  error: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadProducts();
  }

  loadFilters(): void {
    this.productService.getFilters().subscribe({
      next: (filters) => {
        this.filters = filters;
      },
      error: (error) => {
        console.error('Errore nel caricamento filtri:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    
    const params: ProductParams = {
      ...this.currentParams,
      brand: this.selectedBrand || undefined,
      type: this.selectedType || undefined,
      sort: this.selectedSort || undefined,
      search: this.searchTerm || undefined
    };

    this.productService.getProducts(params).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.products = result.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento prodotti:', error);
        this.error = 'Errore nel caricamento dei prodotti';
        this.loading = false;
      }
    });
  }

  onBrandChange(): void {
    this.currentParams.pageIndex = 1;
    this.loadProducts();
  }

  onTypeChange(): void {
    this.currentParams.pageIndex = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentParams.pageIndex = 1;
    this.loadProducts();
  }

  onSearchChange(): void {
    this.currentParams.pageIndex = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentParams.pageIndex = page;
    this.loadProducts();
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  clearFilters(): void {
    this.selectedBrand = '';
    this.selectedType = '';
    this.selectedSort = '';
    this.searchTerm = '';
    this.currentParams.pageIndex = 1;
    this.loadProducts();
  }
}
