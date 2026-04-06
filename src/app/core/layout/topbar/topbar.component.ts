import { Component, HostListener, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { IconComponent } from '../../ui/icon/icon.component';
import type { AppIconName } from '../../ui/icon/icon.types';
import { SidebarStateService } from '../sidebar/sidebar-state.service';
import { ThemeService } from '../../theme/theme.service';

interface ProfileMenuItem {
  readonly id: 'settings' | 'preferences' | 'logout';
  readonly label: string;
  readonly icon: AppIconName;
  readonly tone?: 'default' | 'danger';
}

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
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly themeMode = this.theme.mode;
  readonly currentUser = this.sessionService.currentUser;
  readonly isProfileMenuOpen = signal(false);
  readonly profileMenuItems: readonly ProfileMenuItem[] = [
    { id: 'settings', label: 'Settings', icon: 'edit' },
    { id: 'preferences', label: 'Preferences', icon: 'filter' },
    { id: 'logout', label: 'Log out', icon: 'logout', tone: 'danger' },
  ];

  toggleSidebar(): void {
    this.sidebarState.toggle();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((isOpen) => !isOpen);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  async onProfileMenuAction(item: ProfileMenuItem): Promise<void> {
    if (item.id !== 'logout') {
      this.closeProfileMenu();
      return;
    }

    this.sessionService.clearSession();
    this.closeProfileMenu();
    await this.router.navigateByUrl('/auth/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.profile-menu')) {
      return;
    }
    this.closeProfileMenu();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeProfileMenu();
  }
}
