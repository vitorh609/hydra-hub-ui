import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { IconComponent, AppIconName } from '../../../../core/ui/icon/icon.component';

export type MetricTrend = 'up' | 'down';
export type MetricAccent = 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CardComponent, IconComponent, NgClass],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
})
export class MetricCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) deltaText!: string;
  @Input({ required: true }) trend!: MetricTrend;
  @Input({ required: true }) iconName!: AppIconName;
  @Input({ required: true }) accent!: MetricAccent;

  get accentClass(): string {
    return `accent-${this.accent}`;
  }

  get trendIcon(): AppIconName {
    return this.trend === 'up' ? 'trending-up' : 'trending-down';
  }
}
