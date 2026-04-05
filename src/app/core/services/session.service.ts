import { Injectable, computed, signal } from '@angular/core';
import type { AuthSession } from '../../features/auth/models/auth-session.model';
import type { AuthUser } from '../../features/auth/models/auth-user.model';

const SESSION_KEY = 'hydra_hub.session';

type SessionPersistence = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly sessionSignal = signal<AuthSession | null>(this.readStoredSession());

  readonly session = computed(() => this.sessionSignal());
  readonly accessToken = computed(() => this.sessionSignal()?.accessToken ?? null);
  readonly currentUser = computed<AuthUser | null>(() => this.sessionSignal()?.user ?? null);
  readonly expiresAt = computed(() => this.sessionSignal()?.expiresAt ?? null);
  readonly tokenType = computed(() => this.sessionSignal()?.tokenType ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()?.accessToken));

  setSession(session: AuthSession, persistence: SessionPersistence): void {
    this.clearStorage();

    const storage = persistence === 'local' ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  clearSession(): void {
    this.clearStorage();
    this.sessionSignal.set(null);
  }

  private readStoredSession(): AuthSession | null {
    const rawSession = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
