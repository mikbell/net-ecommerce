import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  Cart,
  CartItem,
  AddCartItem,
  UpdateCartItem,
  CartTotals,
  ApplyDiscountRequest,
} from '../../shared/models/cart';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = environment.apiUrl;
  private cartSource = new BehaviorSubject<Cart | null>(null);
  private cartTotalSource = new BehaviorSubject<CartTotals>(new CartTotals());

  cart$ = this.cartSource.asObservable();
  cartTotal$ = this.cartTotalSource.asObservable();

  constructor(private http: HttpClient) {
    // Tenta di caricare il carrello dal localStorage all'avvio
    this.loadCartFromStorage();
  }

  createCart(): Cart {
    const cart: Cart = {
      id: this.createCartId(),
      items: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      totalItems: 0,
    };
    return cart;
  }

  private createCartId(): string {
    // Genera un ID univoco per il carrello
    let cartId = localStorage.getItem('cart_id');
    if (!cartId) {
      cartId =
        'cart_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
      localStorage.setItem('cart_id', cartId);
    }
    return cartId;
  }

  getCart(id: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.baseUrl}/cart/${id}`).pipe(
      map((cart: Cart) => {
        this.cartSource.next(cart);
        this.calculateTotals();
        this.saveCartToStorage(cart);
        return cart;
      })
    );
  }

  getCurrentCartValue(): Cart | null {
    return this.cartSource.value;
  }

  addItemToCart(item: AddCartItem, cartId?: string): Observable<Cart> {
    const id = cartId || this.getCurrentCartValue()?.id || this.createCartId();

    return this.http.post<Cart>(`${this.baseUrl}/cart/${id}/items`, item).pipe(
      map((cart: Cart) => {
        this.cartSource.next(cart);
        this.calculateTotals();
        this.saveCartToStorage(cart);
        return cart;
      })
    );
  }

  updateCartItemQuantity(
    productId: number,
    quantity: number
  ): Observable<Cart> {
    const cart = this.getCurrentCartValue();
    if (!cart) throw new Error('No cart available');

    const updateItem: UpdateCartItem = { quantity };

    return this.http
      .put<Cart>(
        `${this.baseUrl}/cart/${cart.id}/items/${productId}`,
        updateItem
      )
      .pipe(
        map((updatedCart: Cart) => {
          this.cartSource.next(updatedCart);
          this.calculateTotals();
          this.saveCartToStorage(updatedCart);
          return updatedCart;
        })
      );
  }

  removeCartItem(productId: number): Observable<Cart> {
    const cart = this.getCurrentCartValue();
    if (!cart) throw new Error('No cart available');

    return this.http
      .delete<Cart>(`${this.baseUrl}/cart/${cart.id}/items/${productId}`)
      .pipe(
        map((updatedCart: Cart) => {
          this.cartSource.next(updatedCart);
          this.calculateTotals();
          this.saveCartToStorage(updatedCart);
          return updatedCart;
        })
      );
  }

  clearCart(): Observable<void> {
    const cart = this.getCurrentCartValue();
    if (!cart) return new Observable((subscriber) => subscriber.complete());

    return this.http.delete<void>(`${this.baseUrl}/cart/${cart.id}`).pipe(
      map(() => {
        this.cartSource.next(null);
        this.cartTotalSource.next(new CartTotals());
        this.clearCartFromStorage();
      })
    );
  }

  private calculateTotals(): void {
    const cart = this.getCurrentCartValue();
    if (!cart) return;

    const totals = new CartTotals();
    totals.subtotal = cart.subtotal;
    totals.discount = cart.discountAmount;
    totals.shipping = cart.total > 100 ? 0 : 10; // Spedizione gratuita sopra €100 (dopo sconto)
    totals.total = cart.total + totals.shipping;

    this.cartTotalSource.next(totals);
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  private clearCartFromStorage(): void {
    localStorage.removeItem('cart');
    localStorage.removeItem('cart_id');
  }

  private loadCartFromStorage(): void {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart: Cart = JSON.parse(cartData);
        // Verifica che il carrello abbia la struttura corretta
        if (cart && cart.id && Array.isArray(cart.items)) {
          this.cartSource.next(cart);
          this.calculateTotals();

          // Sincronizza con il server in background
          this.getCart(cart.id).subscribe({
            error: () => {
              // Se il carrello non esiste più sul server, usa quello del localStorage
              console.warn(
                'Cart not found on server, using local storage version'
              );
            },
          });
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.clearCartFromStorage();
      }
    }
  }

  // Metodo helper per verificare se un prodotto è già nel carrello
  isProductInCart(productId: number): boolean {
    const cart = this.getCurrentCartValue();
    if (!cart) return false;
    return cart.items.some((item) => item.productId === productId);
  }

  // Metodo helper per ottenere la quantità di un prodotto nel carrello
  getProductQuantityInCart(productId: number): number {
    const cart = this.getCurrentCartValue();
    if (!cart) return 0;
    const item = cart.items.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  }

  applyDiscount(discountCode: string): Observable<Cart> {
    const cart = this.getCurrentCartValue();
    if (!cart) throw new Error('No cart available');

    const discountRequest: ApplyDiscountRequest = { code: discountCode };

    return this.http
      .post<Cart>(`${this.baseUrl}/cart/${cart.id}/discount`, discountRequest)
      .pipe(
        map((updatedCart: Cart) => {
          this.cartSource.next(updatedCart);
          this.calculateTotals();
          this.saveCartToStorage(updatedCart);
          return updatedCart;
        })
      );
  }

  // Metodo per sincronizzare il carrello locale con il server
  syncCart(): Observable<Cart | null> {
    const cartId = localStorage.getItem('cart_id');
    if (cartId) {
      return this.getCart(cartId);
    }
    return new Observable((subscriber) => {
      subscriber.next(null);
      subscriber.complete();
    });
  }
}
