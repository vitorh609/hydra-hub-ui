import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-account-settings-tabs',
  standalone: true,
  templateUrl: './account-settings-tabs.component.html',
  styleUrl: './account-settings-tabs.component.scss',
})
export class AccountSettingsTabsComponent {
  @Input({ required: true }) tabs: string[] = [];
  @Input({ required: true }) active = '';
  @Output() activeChange = new EventEmitter<string>();

  selectTab(tab: string): void {
    if (tab === this.active) {
      return;
    }
    this.activeChange.emit(tab);
  }
}
