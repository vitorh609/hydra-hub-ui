import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { ProductListItem, ProductStockStatus } from '../../../../shared/models/product.models';
import { TableComponent } from '../../components/table/table.component';
import type { RowAction, TableColumn, TableState } from '../../components/table/table.types';
import { IconComponent } from '../../../../core/ui/icon/icon.component';

interface StatusMeta {
  label: string;
  className: string;
}

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent, IconComponent],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
})
export class ProductListPageComponent {
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly products = signal<ProductListItem[]>(this.buildSeedProducts());
  readonly state = signal<TableState>({ page: 1, pageSize: 5, total: 0 });

  readonly filteredProducts = computed(() => {
    const term = this.searchControl.value.trim().toLowerCase();
    if (!term) {
      return this.products();
    }
    return this.products().filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    });
  });

  readonly pagedProducts = computed(() => {
    const current = this.filteredProducts();
    const { page, pageSize } = this.state();
    const start = (page - 1) * pageSize;
    return current.slice(start, start + pageSize);
  });

  readonly columns: TableColumn<ProductListItem>[] = [
    {
      key: 'name',
      header: 'Product',
      cell: (row) => this.renderProductCell(row),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (row) => this.formatDate(row.date),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => this.renderStatusCell(row.status),
      align: 'center',
    },
    {
      key: 'price',
      header: 'Price',
      align: 'end',
      cell: (row) => this.formatCurrency(row.price),
    },
  ];

  readonly actions: RowAction<ProductListItem>[] = [
    {
      id: 'view',
      label: 'View',
      icon: 'eye',
      action: (row) => {
        // eslint-disable-next-line no-console
        console.log('View product', row);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'edit',
      action: (row) => {
        // eslint-disable-next-line no-console
        console.log('Edit product', row);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      action: (row) => {
        // eslint-disable-next-line no-console
        console.log('Delete product', row);
      },
    },
  ];

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.syncTotal());
    this.syncTotal();
  }

  onStateChange(state: TableState): void {
    this.state.set({ ...state, total: this.filteredProducts().length });
  }

  addProduct(): void {
    this.router.navigateByUrl('/ecommerce/add-product');
  }

  rowId = (row: ProductListItem): string => row.id;

  private syncTotal(): void {
    const total = this.filteredProducts().length;
    const current = this.state();
    const totalPages = Math.max(1, Math.ceil(total / current.pageSize));
    const page = Math.min(current.page, totalPages);
    this.state.set({ ...current, total, page });
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  private renderStatusCell(status: ProductStockStatus): string {
    const meta = this.statusMeta(status);
    return `<span class="badge ${meta.className}">${meta.label}</span>`;
  }

  private renderProductCell(row: ProductListItem): string {
    const initials = row.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const avatar = row.thumbnailUrl
      ? `<img src="${row.thumbnailUrl}" alt="${row.name}" />`
      : `<span>${initials}</span>`;
    return `
      <div class="product-cell">
        <div class="product-avatar">${avatar}</div>
        <div class="product-meta">
          <div class="product-title">${row.name}</div>
          <div class="product-subtitle">${row.category}</div>
        </div>
      </div>
    `;
  }

  private statusMeta(status: ProductStockStatus): StatusMeta {
    if (status === 'IN_STOCK') {
      return { label: 'Stock', className: 'badge-soft-success' };
    }
    return { label: 'Out Of Stock', className: 'badge-soft-danger' };
  }

  private buildSeedProducts(): ProductListItem[] {
    return [
      {
        id: 'p1',
        name: 'Pixel Pro Headphones',
        category: 'Electronics',
        date: '2025-01-11T09:30:00.000Z',
        status: 'IN_STOCK',
        price: 129.0,
      },
      {
        id: 'p2',
        name: 'Smartwatch Active',
        category: 'Accessories',
        date: '2025-01-08T10:15:00.000Z',
        status: 'OUT_OF_STOCK',
        price: 89.5,
      },
      {
        id: 'p3',
        name: 'Aurora Sneakers',
        category: 'Footwear',
        date: '2025-01-05T12:10:00.000Z',
        status: 'IN_STOCK',
        price: 99.0,
      },
      {
        id: 'p4',
        name: 'Studio Backpack',
        category: 'Travel',
        date: '2025-01-03T15:45:00.000Z',
        status: 'IN_STOCK',
        price: 79.0,
      },
      {
        id: 'p5',
        name: 'Nimbus Desk Lamp',
        category: 'Home',
        date: '2025-01-02T09:05:00.000Z',
        status: 'OUT_OF_STOCK',
        price: 45.0,
      },
      {
        id: 'p6',
        name: 'Pulse Water Bottle',
        category: 'Fitness',
        date: '2024-12-30T08:20:00.000Z',
        status: 'IN_STOCK',
        price: 24.0,
      },
      {
        id: 'p7',
        name: 'Voyage Jacket',
        category: 'Apparel',
        date: '2024-12-28T14:00:00.000Z',
        status: 'IN_STOCK',
        price: 149.0,
      },
      {
        id: 'p8',
        name: 'Orbit Camera Kit',
        category: 'Electronics',
        date: '2024-12-26T11:30:00.000Z',
        status: 'OUT_OF_STOCK',
        price: 249.0,
      },
    ];
  }
}
