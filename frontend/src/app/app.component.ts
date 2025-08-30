import { ShopService } from './core/services/shop.service';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { Product } from './shared/models/product';
import { ShopComponent } from "./features/shop/shop.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, ShopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Netshop';

}
