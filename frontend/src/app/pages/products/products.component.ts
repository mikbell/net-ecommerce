import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, ProductParams, PagedResult } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtri
  searchTerm = '';
  selectedBrand = '';
  selectedType = '';
  sortOption = '';
  
  // Paginazione
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  totalCount = 0;
  
  // Filtri disponibili
  brands: string[] = [];
  types: string[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadProducts();
  }

  private loadFilters(): void {
    this.productService.getBrands().subscribe({
      next: (brands) => this.brands = brands,
      error: (error) => console.error('Error loading brands:', error)
    });

    this.productService.getTypes().subscribe({
      next: (types) => this.types = types,
      error: (error) => console.error('Error loading types:', error)
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const params: ProductParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      brand: this.selectedBrand || undefined,
      type: this.selectedType || undefined,
      sort: this.sortOption || undefined
    };

    this.productService.getProducts(params).subscribe({
      next: (result: PagedResult<Product>) => {
        this.products = result.data;
        this.totalPages = result.totalPages;
        this.totalCount = result.count;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Errore nel caricamento dei prodotti';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo(0, 0);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBrand = '';
    this.selectedType = '';
    this.sortOption = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
