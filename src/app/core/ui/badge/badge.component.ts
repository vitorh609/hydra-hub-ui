import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: '<span class="badge" [ngClass]="toneClass"><ng-content></ng-content></span>',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';

  get toneClass(): string {
    switch (this.tone) {
      case 'primary':
        return 'text-bg-primary';
      case 'success':
        return 'text-bg-success';
      case 'warning':
        return 'text-bg-warning';
      case 'danger':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }
}
