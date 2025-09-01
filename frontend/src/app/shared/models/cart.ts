export interface Cart {
  id: string;
  items: CartItem[];
  appliedDiscount?: AppliedDiscount;
  subtotal: number;
  discountAmount: number;
  total: number;
  totalItems: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  pictureUrl: string;
  brand: string;
  type: string;
}

export interface AddCartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  pictureUrl: string;
  brand: string;
  type: string;
}

export interface UpdateCartItem {
  quantity: number;
}

export class CartTotals {
  shipping = 0;
  subtotal = 0;
  discount = 0;
  total = 0;
}

export interface AppliedDiscount {
  code: string;
  name: string;
  type: string;
  value: number;
  discountAmount: number;
}

export interface ApplyDiscountRequest {
  code: string;
}
