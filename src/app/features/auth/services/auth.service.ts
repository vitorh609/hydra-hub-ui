import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { AuthSession } from '../models/auth-session.model';
import type { LoginRequest } from '../models/login-request.model';
import type { LoginResponse } from '../models/login-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly authUrl = `${this.baseUrl}/auth`;

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, payload).pipe(
      map((response) => ({
        accessToken: response.token,
        tokenType: response.type,
        expiresAt: response.expires_at,
        user: response.user,
      }))
    );
  }
}
