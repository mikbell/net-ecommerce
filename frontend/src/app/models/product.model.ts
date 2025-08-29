// Modello Product allineato con ProductDto del backend
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
}

// Modelli per le richieste API
export interface CreateProduct {
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
}

export interface UpdateProduct extends CreateProduct {
  id: number;
}

// Parametri per il filtro prodotti
export interface ProductParams {
  pageIndex?: number;
  pageSize?: number;
  brand?: string;
  type?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Risposta paginata
export interface PagedResult<T> {
  data: T[];
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Filtri disponibili
export interface ProductFilters {
  brands: string[];
  types: string[];
  sortOptions: { value: string; label: string; }[];
}

// Item del carrello
export interface CartItem {
  product: Product;
  quantity: number;
}
