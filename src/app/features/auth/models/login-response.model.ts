import type { AuthUser } from './auth-user.model';

export interface LoginResponse {
  token: string;
  type: string;
  expires_at: string;
  user: AuthUser;
}
