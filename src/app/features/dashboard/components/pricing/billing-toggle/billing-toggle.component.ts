import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { BillingCycle } from '../../../../../shared/models/pricing.models';

@Component({
  selector: 'app-billing-toggle',
  standalone: true,
  templateUrl: './billing-toggle.component.html',
  styleUrl: './billing-toggle.component.scss',
})
export class BillingToggleComponent {
  @Input({ required: true }) value: BillingCycle = 'MONTHLY';
  @Output() valueChange = new EventEmitter<BillingCycle>();

  setValue(value: BillingCycle): void {
    if (value === this.value) {
      return;
    }
    this.valueChange.emit(value);
  }

  get isYearly(): boolean {
    return this.value === 'YEARLY';
  }
}
