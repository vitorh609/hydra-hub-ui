import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import type { ShopProduct } from '../../../../../shared/models/product.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, IconComponent, RatingStarsComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ShopProduct;

  @Output() toggleFavorite = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.product.id);
  }

  onEdit(): void {
    this.edit.emit(this.product.id);
  }

  onRemove(): void {
    this.remove.emit(this.product.id);
  }
}
