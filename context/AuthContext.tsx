'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '@prisma/client';
import { ROLE_INFO_MAP, RoleInfo } from '@/lib/rbac';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  propertyIds: string[];
  avatarUrl?: string | null;
}

// Demo credentials for quick-switch
export const DEMO_ACCOUNTS: { role: UserRole; email: string; password: string }[] = [
  { role: 'ADMIN', email: 'admin@onedirectory.com', password: 'password123' },
  { role: 'PROPERTY_MANAGER', email: 'manager@onedirectory.com', password: 'password123' },
  { role: 'FRONT_DESK', email: 'frontdesk@onedirectory.com', password: 'password123' },
  { role: 'OPERATIONS', email: 'operations@onedirectory.com', password: 'password123' },
  { role: 'ACCOUNTANT', email: 'accounts@onedirectory.com', password: 'password123' },
];

interface AuthContextType {
  user: AuthUser | null;
  roleInfo: RoleInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // On mount, restore session from server cookie via /api/auth/me
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // not authenticated
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return true;
      }
      setLoginError(data.error || 'Login failed. Please try again.');
      return false;
    } catch {
      setLoginError('Network error. Please check your connection.');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  }, []);

  const switchDemoRole = useCallback(async (role: UserRole) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!account) return;
    await login(account.email, account.password);
  }, [login]);

  const clearLoginError = useCallback(() => setLoginError(null), []);

  const roleInfo = user ? ROLE_INFO_MAP[user.role] ?? null : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        roleInfo,
        isAuthenticated: !!user,
        isLoading,
        loginError,
        login,
        logout,
        switchDemoRole,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
