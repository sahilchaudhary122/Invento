/**
 * Authentication API Client
 * Interacts with FastAPI backend auth endpoints:
 * - POST /api/v1/auth/login (OAuth2 form-encoded: username, password)
 * - POST /api/v1/auth/signup (JSON: email, name, password, role)
 * - GET  /api/v1/auth/me (Bearer token authenticated)
 */

import { api } from './client';
import { TokenResponse, User, RegisterPayload } from '../../types/auth';

export const authApi = {
  /**
   * Log in via OAuth2 Password flow
   * Backend expects form-urlencoded body: username and password
   */
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const params = new URLSearchParams();
    params.append('username', email.trim());
    params.append('password', password);

    return api.postForm<TokenResponse>('/auth/login', params);
  },

  /**
   * Register a new user
   */
  register: async (payload: RegisterPayload): Promise<User> => {
    return api.post<User>('/auth/signup', {
      email: payload.email.trim(),
      name: payload.name.trim(),
      password: payload.password,
      role: payload.role ?? 'WAREHOUSE_STAFF',
    });
  },

  /**
   * Fetch current authenticated user profile
   */
  getMe: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },
};
