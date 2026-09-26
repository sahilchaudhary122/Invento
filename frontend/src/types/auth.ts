/**
 * Authentication & User Types
 * Mirrors backend Pydantic schemas in app/schemas/user.py
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  role?: string;
}
