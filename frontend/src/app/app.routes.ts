import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { AboutComponent } from './features/about/about.component';
import { CartComponent } from './features/cart/cart.component';
import { NotFoundComponent } from './features/error-pages/not-found/not-found.component';
import { ServerErrorComponent } from './features/error-pages/server-error/server-error.component';
import { ForbiddenComponent } from './features/error-pages/forbidden/forbidden.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'about', component: AboutComponent },
  
  // Error Pages
  { path: 'error/not-found', component: NotFoundComponent },
  { path: 'error/server-error', component: ServerErrorComponent },
  { path: 'error/forbidden', component: ForbiddenComponent },
  
  // 404 catch-all - deve essere l'ultimo
  { path: '**', component: NotFoundComponent },
];
