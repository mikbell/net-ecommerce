import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Product, 
  CreateProduct, 
  UpdateProduct, 
  ProductParams, 
  PagedResult, 
  ProductFilters 
} from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Products endpoints
  getProducts(params?: ProductParams): Observable<PagedResult<Product>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageIndex) httpParams = httpParams.set('pageIndex', params.pageIndex.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.brand) httpParams = httpParams.set('brand', params.brand);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }

    return this.http.get<PagedResult<Product>>(`${this.baseUrl}/products`, { params: httpParams });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: number, product: UpdateProduct): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/brands`);
  }

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/types`);
  }

  getFilters(): Observable<ProductFilters> {
    return this.http.get<ProductFilters>(`${this.baseUrl}/products/filters`);
  }

  // Search endpoints (se disponibili)
  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Product[]>(`${this.baseUrl}/search`, { params });
  }
}
