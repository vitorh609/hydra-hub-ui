import { Component } from '@angular/core';
import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { SalesOverviewCardComponent } from '../../components/sales-overview-card/sales-overview-card.component';
import { PaymentMethodsCardComponent } from '../../components/payment-methods-card/payment-methods-card.component';
import { TransactionsTableComponent } from '../../components/transactions-table/transactions-table.component';
import { TrafficSourcesCardComponent } from '../../components/traffic-sources-card/traffic-sources-card.component';
import { ProductsTableComponent } from '../../components/products-table/products-table.component';

@Component({
  selector: 'app-dashboard2-page',
  standalone: true,
  imports: [
    PageContainerComponent,
    MetricCardComponent,
    SalesOverviewCardComponent,
    PaymentMethodsCardComponent,
    TransactionsTableComponent,
    TrafficSourcesCardComponent,
    ProductsTableComponent,
  ],
  templateUrl: './dashboard2-page.component.html',
  styleUrl: './dashboard2-page.component.scss',
})
export class Dashboard2PageComponent {}
