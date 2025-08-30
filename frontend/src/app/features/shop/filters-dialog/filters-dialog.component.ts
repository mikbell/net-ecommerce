import { Component } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { inject } from '@angular/core';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters-dialog',
  imports: [
    MatSelectionList,
    MatListOption,
    MatIcon,
    MatIconButton,
    FormsModule,
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss',
})
export class FiltersDialogComponent {
  ShopService = inject(ShopService);
  private dialogRef = inject(MatDialogRef<FiltersDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  selectedBrands = this.data?.selectedBrands || [];
  selectedTypes = this.data?.selectedTypes || [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  quickFilter: string | null = null;

  applyFilters() {
    this.dialogRef.close({
      selectedBrands: this.selectedBrands,
      selectedTypes: this.selectedTypes,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      quickFilter: this.quickFilter,
    });
  }

  resetFilters() {
    this.selectedBrands = [];
    this.selectedTypes = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.quickFilter = null;
  }
}
