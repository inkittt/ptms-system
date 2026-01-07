'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginData, RegisterData, ConsentData } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<{ requiresConsent?: boolean; requiresMfa?: boolean; userId?: string }>;
  register: (data: RegisterData) => Promise<void>;
  submitConsent: (data: ConsentData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Failed to load user:', error);
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        authService.clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await authService.login(data);

    if (response.requiresConsent) {
      return { requiresConsent: true, userId: response.userId };
    }

    if (response.requiresMfa) {
      return { requiresMfa: true, userId: response.userId };
    }

    if (response.user) {
      setUser(response.user);
      
      switch (response.user.role) {
        case 'STUDENT':
          router.push('/student/dashboard');
          break;
        case 'COORDINATOR':
          router.push('/coordinator/dashboard');
          break;
        case 'LECTURER':
          router.push('/supervisor/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }

    return {};
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
  };

  const submitConsent = async (data: ConsentData) => {
    const response = await authService.submitConsent(data);
    
    if (response.user) {
      setUser(response.user);
      
      switch (response.user.role) {
        case 'STUDENT':
          router.push('/student/dashboard');
          break;
        case 'COORDINATOR':
          router.push('/coordinator/dashboard');
          break;
        case 'LECTURER':
          router.push('/supervisor/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const getToken = () => {
    return authService.getAccessToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        submitConsent,
        logout,
        refreshUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
