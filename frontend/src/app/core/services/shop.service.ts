import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { ErrorHandlingService } from './error-handling.service';
import { ErrorType, ErrorSeverity } from '../../shared/models/error';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
  private errorHandlingService = inject(ErrorHandlingService);
  types: string[] = [];
  brands: string[] = [];

  getProducts(shopParams: ShopParams): Observable<Pagination<Product>> {
    let params = new HttpParams();

    // Validate input parameters
    if (shopParams.pageIndex < 1) {
      return throwError(() => new Error('Page index must be greater than 0'));
    }

    if (shopParams.pageSize < 1 || shopParams.pageSize > 100) {
      return throwError(() => new Error('Page size must be between 1 and 100'));
    }

    if (shopParams.brands && shopParams.brands.length > 0) {
      shopParams.brands.forEach((brand) => {
        params = params.append('brands', brand);
      });
    }

    if (shopParams.types && shopParams.types.length > 0) {
      shopParams.types.forEach((type) => {
        params = params.append('types', type);
      });
    }

    if (shopParams.sort) {
      params = params.append('sort', shopParams.sort);
    }

    if (shopParams.search) {
      params = params.append('search', shopParams.search);
    }

    params = params
      .append('pageIndex', shopParams.pageIndex.toString())
      .append('pageSize', shopParams.pageSize.toString());

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', {
      params,
    }).pipe(
      tap((result) => {
        console.log(`Loaded ${result.data.length} products from ${result.count} total`);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error loading products:', error);
        // The interceptor will handle the error, but we still need to rethrow it
        return throwError(() => error);
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    // Validate input
    if (!id || id <= 0) {
      return throwError(() => new Error('Product ID must be a positive number'));
    }

    return this.http.get<Product>(`${this.baseUrl}products/${id}`).pipe(
      tap((product) => {
        console.log(`Loaded product: ${product.name}`);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error loading product ${id}:`, error);
        
        // Handle specific error cases
        if (error.status === 404) {
          this.errorHandlingService.handleNotFound('prodotto');
        }
        
        return throwError(() => error);
      })
    );
  }

  getBrands(): Observable<string[]> {
    // Return cached data if available
    if (this.brands.length > 0) {
      return of(this.brands);
    }

    return this.http.get<string[]>(this.baseUrl + 'products/brands').pipe(
      tap((brands) => {
        this.brands = brands;
        console.log(`Loaded ${brands.length} brands`);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error loading brands:', error);
        this.errorHandlingService.showError({
          type: error.status === 0 ? ErrorType.NETWORK : ErrorType.SERVER,
          severity: ErrorSeverity.ERROR,
          title: 'Errore caricamento marchi',
          message: 'Impossibile caricare l\'elenco dei marchi. Verranno utilizzati i filtri base.',
          action: 'Riprova'
        });
        
        // Return empty array as fallback
        return of([]);
      })
    );
  }

  getTypes(): Observable<string[]> {
    // Return cached data if available
    if (this.types.length > 0) {
      return of(this.types);
    }

    return this.http.get<string[]>(this.baseUrl + 'products/types').pipe(
      tap((types) => {
        this.types = types;
        console.log(`Loaded ${types.length} product types`);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error loading types:', error);
        this.errorHandlingService.showError({
          type: error.status === 0 ? ErrorType.NETWORK : ErrorType.SERVER,
          severity: ErrorSeverity.ERROR,
          title: 'Errore caricamento categorie',
          message: 'Impossibile caricare l\'elenco delle categorie. Verranno utilizzati i filtri base.',
          action: 'Riprova'
        });
        
        // Return empty array as fallback
        return of([]);
      })
    );
  }

  // Initialize brands and types with proper error handling
  initializeFilters(): void {
    this.getBrands().subscribe();
    this.getTypes().subscribe();
  }

  // Clear cached data (useful for refresh scenarios)
  clearCache(): void {
    this.brands = [];
    this.types = [];
  }

  // Utility method to check if service is available
  healthCheck(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}health`).pipe(
      map(() => true),
      tap(() => console.log('API health check passed')),
      catchError((error) => {
        console.warn('API health check failed:', error);
        return of(false);
      })
    );
  }
}
