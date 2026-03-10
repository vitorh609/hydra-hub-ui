import { AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
import { IconRegistryService } from './icon-registry.service';
import type { AppIconName } from './icon.types';

export type { AppIconName } from './icon.types';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent implements OnChanges {
  private readonly registry = inject(IconRegistryService);

  @Input({ required: true }) name!: AppIconName;
  @Input() size = 20;

  icon$?: Observable<SafeHtml>;

  ngOnChanges(): void {
    this.icon$ = this.registry.getIcon(this.name);
  }
}
