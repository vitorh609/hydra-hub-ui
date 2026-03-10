import { Component, computed, signal } from '@angular/core';

import type { BillingCycle, PricingPlan } from '../../../../shared/models/pricing.models';
import { BillingToggleComponent } from '../../components/pricing/billing-toggle/billing-toggle.component';
import { PricingCardComponent } from '../../components/pricing/pricing-card/pricing-card.component';

const seedPlans: PricingPlan[] = [
  {
    id: 'silver',
    title: 'SILVER',
    priceMonthly: 0,
    priceYearly: 0,
    badge: null,
    ctaText: 'Choose Silver',
    features: [
      { label: 'Community support', included: true },
      { label: 'Unlimited members', included: true },
      { label: '1 custom domain', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: '24/7 support', included: false },
    ],
  },
  {
    id: 'bronze',
    title: 'BRONZE',
    priceMonthly: 10.99,
    priceYearly: 109.9,
    badge: 'POPULAR',
    ctaText: 'Choose Bronze',
    features: [
      { label: 'Community support', included: true },
      { label: 'Unlimited members', included: true },
      { label: '1 custom domain', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: '24/7 support', included: false },
    ],
  },
  {
    id: 'gold',
    title: 'GOLD',
    priceMonthly: 22.99,
    priceYearly: 229.9,
    badge: null,
    ctaText: 'Choose Gold',
    features: [
      { label: 'Community support', included: true },
      { label: 'Unlimited members', included: true },
      { label: '1 custom domain', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: '24/7 support', included: true },
    ],
  },
];

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [BillingToggleComponent, PricingCardComponent],
  templateUrl: './pricing-page.component.html',
  styleUrl: './pricing-page.component.scss',
})
export class PricingPageComponent {
  readonly billing = signal<BillingCycle>('MONTHLY');
  readonly plans = signal<PricingPlan[]>(seedPlans);

  readonly isYearly = computed(() => this.billing() === 'YEARLY');

  setBilling(value: BillingCycle): void {
    this.billing.set(value);
  }

  onChoose(plan: PricingPlan): void {
    // eslint-disable-next-line no-console
    console.log('Pricing choice', { planId: plan.id, billing: this.billing() });
  }
}
