import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, AppIconName } from '../../ui/icon/icon.component';
import { SidebarStateService } from './sidebar-state.service';

interface NavItem {
  label: string;
  icon: AppIconName;
  route?: string;
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly sidebarState = inject(SidebarStateService);
  private readonly router = inject(Router);
  private readonly expandedItems = signal<Record<string, boolean>>({});

  readonly isCollapsed = computed(() => this.sidebarState.collapsed());

  readonly groups: NavGroup[] = [
    {
      title: 'Dashboards',
      items: [
        { label: 'Dashboard 2', icon: 'dashboard', route: '/dashboards/dashboard2' },
      ],
    },
    {
      title: 'Ecommerce',
      items: [
        // { label: 'Orders', icon: 'cart' },
        {
          label: 'Products',
          icon: 'store',
          children: [
            { label: 'Shop', icon: 'store', route: '/ecommerce/shop' },
            { label: 'Product List', icon: 'store', route: '/ecommerce/product-list' },
            { label: 'Add Product', icon: 'store', route: '/ecommerce/add-product' },
          ],
        },
        // { label: 'Logistics', icon: 'truck' },
      ],
    },
    // {
    //   title: 'Analytics',
    //   items: [
    //     { label: 'Sales', icon: 'chart' },
    //     { label: 'Revenue', icon: 'chart-pie' },
    //     { label: 'Reports', icon: 'receipt' },
    //   ],
    // },
    {
      title: 'Apps',
      items: [
        { label: 'Notes', icon: 'file-text', route: '/apps/notes' },
        { label: 'Tickets', icon: 'ticket', route: '/tickets' },
      ],
    },
    {
      title: 'Pages',
      items: [
        { label: 'Account Setting', icon: 'user', route: '/settings/account' },
        { label: 'Documents', icon: 'file-text', route: '/documents' },
      ],
    },
    {
      title: 'Prices',
      items: [{ label: 'Pricing', icon: 'credit-card', route: '/prices/pricing' }],
    },
  ];

  toggleItem(item: NavItem): void {
    if (!item.children?.length || this.isCollapsed()) {
      return;
    }

    this.expandedItems.update((items) => ({
      ...items,
      [item.label]: !this.isItemExpanded(item),
    }));
  }

  isItemExpanded(item: NavItem): boolean {
    return this.expandedItems()[item.label] ?? this.hasActiveChild(item);
  }

  hasActiveChild(item: NavItem): boolean {
    return !!item.children?.some(
      (child) =>
        !!child.route &&
        this.router.isActive(child.route, {
          paths: 'subset',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        }),
    );
  }
}
