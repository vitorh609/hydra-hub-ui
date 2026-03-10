import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

import type { ThemeMode } from './theme.types';

const STORAGE_KEY = 'app.themeMode';

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'dark' || value === 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly documentRef = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>('dark');

  constructor() {
    const saved = this.readStoredMode();
    if (saved) {
      this.mode.set(saved);
    }

    effect(() => {
      const mode = this.mode();
      this.documentRef.documentElement.setAttribute('data-theme', mode);
      this.persistMode(mode);
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  private readStoredMode(): ThemeMode | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isThemeMode(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  private persistMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors (e.g., privacy mode).
    }
  }
}
