import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-settings-actions-bar',
  standalone: true,
  templateUrl: './settings-actions-bar.component.html',
  styleUrl: './settings-actions-bar.component.scss',
})
export class SettingsActionsBarComponent {
  @Output() cancel = new EventEmitter<void>();
}
