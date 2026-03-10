import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { ProductCategory, ShopProduct, SortOption } from '../../../../shared/models/product.models';
import { ShopFiltersComponent } from '../../components/shop/shop-filters/shop-filters.component';
import { ProductCardComponent } from '../../components/shop/product-card/product-card.component';
import { IconComponent } from '../../../../core/ui/icon/icon.component';

type CategoryOption = ProductCategory | 'All';

const FAVORITES_KEY = 'app.shop.favorites';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [ReactiveFormsModule, ShopFiltersComponent, ProductCardComponent, IconComponent],
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.scss',
})
export class ShopPageComponent {
  private readonly router = inject(Router);

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly selectedCategory = signal<CategoryOption>('All');
  readonly selectedSort = signal<SortOption>('NEWEST');

  readonly products = signal<ShopProduct[]>(this.applyFavorites(this.buildSeedProducts()));

  readonly categories: CategoryOption[] = ['All', 'Fashion', 'Books', 'Toys', 'Electronics'];
  readonly sortOptions: SortOption[] = ['NEWEST', 'PRICE_HIGH_LOW', 'PRICE_LOW_HIGH', 'DISCOUNTED'];

  readonly filtered = computed(() => {
    const term = this.searchCtrl.value.trim().toLowerCase();
    const category = this.selectedCategory();
    return this.products().filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  readonly sorted = computed(() => {
    const list = [...this.filtered()];
    const sort = this.selectedSort();
    switch (sort) {
      case 'PRICE_HIGH_LOW':
        return list.sort((a, b) => b.price - a.price);
      case 'PRICE_LOW_HIGH':
        return list.sort((a, b) => a.price - b.price);
      case 'DISCOUNTED':
        return list.sort((a, b) => {
          const aDiscount = a.oldPrice && a.oldPrice > a.price ? 1 : 0;
          const bDiscount = b.oldPrice && b.oldPrice > b.price ? 1 : 0;
          return bDiscount - aDiscount;
        });
      case 'NEWEST':
      default:
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  });

  constructor() {
    this.searchCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe();

    effect(() => {
      this.persistFavorites();
    });
  }

  updateCategory(category: CategoryOption): void {
    this.selectedCategory.set(category);
  }

  updateSort(option: SortOption): void {
    this.selectedSort.set(option);
  }

  addProduct(): void {
    this.router.navigateByUrl('/ecommerce/add-product');
  }

  toggleFavorite(id: string): void {
    this.products.update((products) =>
      products.map((product) =>
        product.id === id ? { ...product, isFavorite: !product.isFavorite } : product,
      ),
    );
  }

  editProduct(id: string): void {
    // eslint-disable-next-line no-console
    console.log('Edit product', id);
  }

  removeProduct(id: string): void {
    // eslint-disable-next-line no-console
    console.log('Remove product', id);
  }

  private persistFavorites(): void {
    const favorites = this.products()
      .filter((product) => product.isFavorite)
      .map((product) => product.id);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
  }

  private applyFavorites(products: ShopProduct[]): ShopProduct[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) {
        return products;
      }
      const ids = new Set(JSON.parse(raw) as string[]);
      return products.map((product) => ({ ...product, isFavorite: ids.has(product.id) }));
    } catch {
      return products;
    }
  }

  private buildSeedProducts(): ShopProduct[] {
    return [
      {
        id: 's1',
        name: 'Nimbus Jacket',
        category: 'Fashion',
        price: 129,
        oldPrice: 159,
        rating: 4.5,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/fashion-jacket/800/600',
        createdAt: '2025-01-15T09:00:00.000Z',
      },
      {
        id: 's2',
        name: 'Aura Sneakers',
        category: 'Fashion',
        price: 98,
        oldPrice: 120,
        rating: 4.0,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/fashion-sneakers/800/600',
        createdAt: '2025-01-12T11:30:00.000Z',
      },
      {
        id: 's3',
        name: 'Orbit Headphones',
        category: 'Electronics',
        price: 149,
        oldPrice: 179,
        rating: 4.8,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/electronics-headphone/800/600',
        createdAt: '2025-01-10T08:15:00.000Z',
      },
      {
        id: 's4',
        name: 'Pixel Laptop Sleeve',
        category: 'Electronics',
        price: 39,
        rating: 3.8,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/electronics-sleeve/800/600',
        createdAt: '2025-01-08T10:45:00.000Z',
      },
      {
        id: 's5',
        name: 'Storytime Book Set',
        category: 'Books',
        price: 42,
        oldPrice: 55,
        rating: 4.2,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/books/800/600',
        createdAt: '2025-01-06T16:10:00.000Z',
      },
      {
        id: 's6',
        name: 'Adventure Comics',
        category: 'Books',
        price: 18,
        rating: 3.5,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/comics/800/600',
        createdAt: '2025-01-03T13:20:00.000Z',
      },
      {
        id: 's7',
        name: 'Robot Building Kit',
        category: 'Toys',
        price: 62,
        oldPrice: 79,
        rating: 4.6,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/robot-toy/800/600',
        createdAt: '2025-01-01T09:00:00.000Z',
      },
      {
        id: 's8',
        name: 'Wooden Train',
        category: 'Toys',
        price: 35,
        rating: 4.1,
        isFavorite: false,
        imageUrl: 'https://picsum.photos/seed/toy-train/800/600',
        createdAt: '2024-12-29T12:00:00.000Z',
      },
    ];
  }
}
