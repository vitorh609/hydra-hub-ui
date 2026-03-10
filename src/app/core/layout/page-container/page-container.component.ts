import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  standalone: true,
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
})
export class PageContainerComponent {
  @Input({ required: true }) title!: string;
}
