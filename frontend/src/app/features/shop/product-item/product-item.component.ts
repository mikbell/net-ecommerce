import { Component, Input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-product-item',
  imports: [MatIcon, MatIconButton, CurrencyPipe],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss',
})
export class ProductItemComponent {
  @Input() product?: Product;
}
