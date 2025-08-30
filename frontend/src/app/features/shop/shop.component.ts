import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { ProductItemComponent } from './product-item/product-item.component';
import { MatDialog } from '@angular/material/dialog';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatIcon } from '@angular/material/icon';
import {
  MatSelectionList,
  MatListOption,
  MatSelectionListChange,
} from '@angular/material/list';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { ShopParams } from '../../shared/models/shopParams';
import { Pagination } from '../../shared/models/pagination';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  imports: [
    ProductItemComponent,
    MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuModule,
    MatPaginatorModule,
    FormsModule,
],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  products: Pagination<Product> | null = null;
  sortOptions = [
    { name: 'Nome', value: 'name' },
    { name: 'Prezzo: dal più basso', value: 'priceAsc' },
    { name: 'Prezzo: dal più alto', value: 'priceDesc' },
  ];
  shopParams = new ShopParams();
  pageSizeOptions = [12, 24, 36];
  isLoading = false;
  hasActiveFilters = false;
  activeFiltersCount = 0;

  ngOnInit(): void {
    this.initializeShop();
  }

  initializeShop() {
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.getProducts();
  }

  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onSearchChange() {
    this.shopParams.pageIndex = 1;
    this.getProducts();
  }

  onPageChange(pageIndex: number) {
    this.shopParams.pageIndex = pageIndex;
    this.getProducts();
  }

  onPageSizeChange(pageSize: number) {
    this.shopParams.pageSize = pageSize;
    this.shopParams.pageIndex = 1; // Reset to first page when changing page size
    this.getProducts();
  }

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageIndex = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }


  onSortChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    if (selectedOption) {
      this.shopParams.sort = selectedOption.value;
      this.shopParams.pageIndex = 1;
      this.getProducts();
    }
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.shopParams.brands = result.selectedBrands || [];
        this.shopParams.types = result.selectedTypes || [];
        this.shopParams.sort = result.selectedSort || 'name';
        this.shopParams.pageIndex = 1;
        this.getProducts();
      }
    });
  }

  clearSearch() {
    this.shopParams.search = '';
    this.shopParams.pageIndex = 1;
    this.getProducts();
  }

  clearAllFilters() {
    this.shopParams.brands = [];
    this.shopParams.types = [];
    this.shopParams.search = '';
    this.shopParams.pageIndex = 1;
    this.hasActiveFilters = false;
    this.activeFiltersCount = 0;
    this.getProducts();
  }
}
