import { Component } from '@angular/core';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { IconComponent } from '../../../../core/ui/icon/icon.component';

interface PaymentMethod {
  label: string;
  amount: string;
  icon: 'brand-paypal' | 'wallet' | 'credit-card' | 'refresh';
}

@Component({
  selector: 'app-payment-methods-card',
  standalone: true,
  imports: [CardComponent, IconComponent],
  templateUrl: './payment-methods-card.component.html',
  styleUrl: './payment-methods-card.component.scss',
})
export class PaymentMethodsCardComponent {
  readonly methods: PaymentMethod[] = [
    { label: 'Paypal', amount: '$6,820', icon: 'brand-paypal' },
    { label: 'Wallet', amount: '$4,280', icon: 'wallet' },
    { label: 'Credit Card', amount: '$2,940', icon: 'credit-card' },
    { label: 'Refund', amount: '$420', icon: 'refresh' },
  ];
}
