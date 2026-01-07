// Authentication Service
import { api } from './api';

export type UserRole = 'STUDENT' | 'COORDINATOR' | 'LECTURER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  matricNo?: string;
  program?: string;
  phone?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  matricNo?: string;
  program?: string;
  phone?: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  requiresConsent?: boolean;
  requiresMfa?: boolean;
  userId?: string;
  message?: string;
}

export interface ConsentData {
  userId: string;
  pdpaConsent: boolean;
  tosAccepted: boolean;
}

export const authService = {
  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    return api.post('/auth/register', data);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  },

  async submitConsent(data: ConsentData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/consent', data);
    
    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  },

  async verifyMfa(userId: string, token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-mfa', {
      userId,
      token,
    });
    
    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  },

  async getProfile(): Promise<User> {
    return api.get('/auth/profile');
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  },

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (_) {
    } finally {
      this.clearTokens();
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
