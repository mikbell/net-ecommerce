import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent)
  },
  { 
    path: 'products', 
    loadComponent: () => import('./pages/products/products.component').then(c => c.ProductsComponent)
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./pages/cart/cart.component').then(c => c.CartComponent)
  },
  { path: '**', redirectTo: '/home' }
];
