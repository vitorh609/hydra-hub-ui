import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { Dashboard2PageComponent } from './features/dashboard/pages/dashboard2-page/dashboard2-page.component';
import { NotesPageComponent } from './features/dashboard/pages/notes-page/notes-page.component';
import { AddProductPageComponent } from './features/dashboard/pages/add-product-page/add-product-page.component';
import { ProductListPageComponent } from './features/dashboard/pages/product-list-page/product-list-page.component';
import { ShopPageComponent } from './features/dashboard/pages/shop-page/shop-page.component';
import { AccountSettingsPageComponent } from './features/dashboard/pages/account-settings-page/account-settings-page.component';
import { PricingPageComponent } from './features/dashboard/pages/pricing-page/pricing-page.component';
import { DocumentsPageComponent } from './features/dashboard/pages/documents-page/documents-page.component';
import { TicketsPageComponent } from './features/dashboard/pages/tickets-page/tickets-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth/login',
    component: LoginPageComponent,
  },
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'dashboards/dashboard2',
        component: Dashboard2PageComponent,
      },
      {
        path: 'apps/notes',
        component: NotesPageComponent,
      },
      {
        path: 'ecommerce/add-product',
        component: AddProductPageComponent,
      },
      {
        path: 'ecommerce/product-list',
        component: ProductListPageComponent,
      },
      {
        path: 'ecommerce/shop',
        component: ShopPageComponent,
      },
      {
        path: 'settings/account',
        component: AccountSettingsPageComponent,
      },
      {
        path: 'prices/pricing',
        component: PricingPageComponent,
      },
      {
        path: 'documents',
        component: DocumentsPageComponent,
      },
      {
        path: 'tickets',
        component: TicketsPageComponent,
      },
    ],
  },
];
