import { Component } from '@angular/core';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { BadgeComponent, BadgeTone } from '../../../../core/ui/badge/badge.component';

interface TransactionRow {
  invoiceId: string;
  customer: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Cancelled';
}

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [CardComponent, BadgeComponent],
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.scss',
})
export class TransactionsTableComponent {
  readonly rows: TransactionRow[] = [
    { invoiceId: '#2432', customer: 'Liam Carter', date: 'May 12, 2024', amount: '$1,250', status: 'Paid' },
    { invoiceId: '#2431', customer: 'Ava Ross', date: 'May 11, 2024', amount: '$890', status: 'Pending' },
    { invoiceId: '#2430', customer: 'Noah Brooks', date: 'May 10, 2024', amount: '$420', status: 'Paid' },
    { invoiceId: '#2429', customer: 'Emma Stone', date: 'May 09, 2024', amount: '$2,140', status: 'Cancelled' },
    { invoiceId: '#2428', customer: 'Mason Lee', date: 'May 08, 2024', amount: '$640', status: 'Paid' },
  ];

  badgeTone(status: TransactionRow['status']): BadgeTone {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      default:
        return 'danger';
    }
  }
}
