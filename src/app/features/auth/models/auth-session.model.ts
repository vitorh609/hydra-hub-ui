import type { AuthUser } from './auth-user.model';

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: AuthUser;
}
