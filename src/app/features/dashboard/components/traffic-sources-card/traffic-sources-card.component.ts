import { Component } from '@angular/core';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { ProgressComponent, ProgressTone } from '../../../../core/ui/progress/progress.component';

interface TrafficSource {
  label: string;
  value: number;
  percentage: string;
  tone: ProgressTone;
}

@Component({
  selector: 'app-traffic-sources-card',
  standalone: true,
  imports: [CardComponent, ProgressComponent],
  templateUrl: './traffic-sources-card.component.html',
  styleUrl: './traffic-sources-card.component.scss',
})
export class TrafficSourcesCardComponent {
  readonly sources: TrafficSource[] = [
    { label: 'Direct', value: 78, percentage: '38%', tone: 'primary' },
    { label: 'Social', value: 56, percentage: '24%', tone: 'success' },
    { label: 'Referral', value: 42, percentage: '18%', tone: 'warning' },
    { label: 'Email', value: 30, percentage: '12%', tone: 'danger' },
  ];
}
