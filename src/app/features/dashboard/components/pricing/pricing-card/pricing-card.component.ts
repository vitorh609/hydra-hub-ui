import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CardComponent } from '../../../../../core/ui/card/card.component';
import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import type { BillingCycle, PricingPlan } from '../../../../../shared/models/pricing.models';

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  imports: [CardComponent, IconComponent],
  templateUrl: './pricing-card.component.html',
  styleUrl: './pricing-card.component.scss',
})
export class PricingCardComponent {
  @Input({ required: true }) plan!: PricingPlan;
  @Input({ required: true }) billing!: BillingCycle;
  @Output() choose = new EventEmitter<PricingPlan>();

  get price(): number {
    return this.billing === 'YEARLY' ? this.plan.priceYearly : this.plan.priceMonthly;
  }

  get suffix(): string {
    return this.billing === 'YEARLY' ? '/yr' : '/mo';
  }

  get displayPrice(): string {
    if (this.price === 0) {
      return 'Free';
    }
    return `$${this.price.toFixed(2)}`;
  }
}
