import { Component } from '@angular/core';
import { CardComponent } from '../../../../core/ui/card/card.component';

@Component({
  selector: 'app-sales-overview-card',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './sales-overview-card.component.html',
  styleUrl: './sales-overview-card.component.scss',
})
export class SalesOverviewCardComponent {}
