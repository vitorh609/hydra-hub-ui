import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import type { ProductCategory, SortOption } from '../../../../../shared/models/product.models';

type CategoryOption = ProductCategory | 'All';

@Component({
  selector: 'app-shop-filters',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './shop-filters.component.html',
  styleUrl: './shop-filters.component.scss',
})
export class ShopFiltersComponent {
  @Input() categories: CategoryOption[] = [];
  @Input() selectedCategory: CategoryOption = 'All';
  @Input() sortOptions: SortOption[] = [];
  @Input() selectedSort: SortOption = 'NEWEST';

  @Output() categoryChange = new EventEmitter<CategoryOption>();
  @Output() sortChange = new EventEmitter<SortOption>();
  @Output() addProduct = new EventEmitter<void>();

  setCategory(category: CategoryOption): void {
    this.categoryChange.emit(category);
  }

  setSort(option: SortOption): void {
    this.sortChange.emit(option);
  }

  onAddProduct(): void {
    this.addProduct.emit();
  }
}
