import { Component } from '@angular/core';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { BadgeComponent } from '../../../../core/ui/badge/badge.component';

interface ProductRow {
  name: string;
  category: string;
  sales: string;
  stock: string;
  status: 'Active' | 'Low Stock';
}

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [CardComponent, BadgeComponent],
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.scss',
})
export class ProductsTableComponent {
  readonly products: ProductRow[] = [
    { name: 'Nimbus Sneakers', category: 'Footwear', sales: '$9,420', stock: '180 pcs', status: 'Active' },
    { name: 'Echo Headphones', category: 'Audio', sales: '$6,280', stock: '60 pcs', status: 'Active' },
    { name: 'Aurora Jacket', category: 'Apparel', sales: '$4,900', stock: '24 pcs', status: 'Low Stock' },
    { name: 'Atlas Backpack', category: 'Accessories', sales: '$3,120', stock: '40 pcs', status: 'Active' },
  ];
}
