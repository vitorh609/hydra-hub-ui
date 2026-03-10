export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: 'silver' | 'bronze' | 'gold';
  title: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: 'POPULAR' | null;
  features: PricingFeature[];
  ctaText: string;
}
