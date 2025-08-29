import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  Product, 
  ProductParams, 
  PagedResult, 
  ProductFilters,
  CreateProduct,
  UpdateProduct
} from '../models/product.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiService: ApiService) { }

  // Metodi per la gestione prodotti con paginazione
  getProducts(params?: ProductParams): Observable<PagedResult<Product>> {
    return this.apiService.getProducts(params);
  }

  getProductById(id: number): Observable<Product> {
    return this.apiService.getProduct(id);
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.apiService.createProduct(product);
  }

  updateProduct(id: number, product: UpdateProduct): Observable<void> {
    return this.apiService.updateProduct(id, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.deleteProduct(id);
  }

  // Metodi per filtri
  getBrands(): Observable<string[]> {
    return this.apiService.getBrands();
  }

  getTypes(): Observable<string[]> {
    return this.apiService.getTypes();
  }

  getFilters(): Observable<ProductFilters> {
    return this.apiService.getFilters();
  }

  // Metodi di convenienza
  getAllProducts(): Observable<Product[]> {
    return this.getProducts({ pageSize: 50 }).pipe(
      map(result => result.data)
    );
  }

  searchProducts(term: string, params?: ProductParams): Observable<PagedResult<Product>> {
    const searchParams = { ...params, search: term };
    return this.getProducts(searchParams);
  }

  getProductsByType(type: string, params?: ProductParams): Observable<PagedResult<Product>> {
    const typeParams = { ...params, type: type };
    return this.getProducts(typeParams);
  }

  getProductsByBrand(brand: string, params?: ProductParams): Observable<PagedResult<Product>> {
    const brandParams = { ...params, brand: brand };
    return this.getProducts(brandParams);
  }
}
