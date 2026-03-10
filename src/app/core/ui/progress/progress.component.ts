import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() tone: ProgressTone = 'primary';

  get barColor(): string {
    return `var(--${this.tone})`;
  }
}
