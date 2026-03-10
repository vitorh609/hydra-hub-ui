import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../../ui/icon/icon.component';
import { SidebarStateService } from '../sidebar/sidebar-state.service';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly sidebarState = inject(SidebarStateService);
  private readonly theme = inject(ThemeService);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly themeMode = this.theme.mode;

  toggleSidebar(): void {
    this.sidebarState.toggle();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
