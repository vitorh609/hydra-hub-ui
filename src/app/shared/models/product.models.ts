export type ProductStatus = 'IN_STOCK' | 'OUT_OF_STOCK';

export interface ProductFormValue {
  title: string;
  price: number;
  size?: string;
  description: string;
  status: ProductStatus;
  thumbnailBase64?: string;
  mediaBase64?: string;
}

export type ProductStockStatus = 'IN_STOCK' | 'OUT_OF_STOCK';

export interface ProductListItem {
  id: string;
  name: string;
  category: string;
  date: string;
  status: ProductStockStatus;
  price: number;
  thumbnailUrl?: string;
}

export type ProductCategory = 'Fashion' | 'Books' | 'Toys' | 'Electronics';
export type SortOption = 'NEWEST' | 'PRICE_HIGH_LOW' | 'PRICE_LOW_HIGH' | 'DISCOUNTED';

export interface ShopProduct {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  rating: number;
  isFavorite: boolean;
  imageUrl: string;
  createdAt: string;
  inStock?: boolean;
}
