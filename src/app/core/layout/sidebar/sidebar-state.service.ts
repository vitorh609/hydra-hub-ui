import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly collapsed = signal(false);

  toggle(): void {
    this.collapsed.update((value) => !value);
  }

  setCollapsed(value: boolean): void {
    this.collapsed.set(value);
  }
}
