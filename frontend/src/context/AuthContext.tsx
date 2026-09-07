import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, AuthResponse } from '@/types/auth';
import apiClient from '@/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeOutletId: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setActiveOutlet: (outletId: string) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeOutletId, setActiveOutletId] = useState<string | null>(
    localStorage.getItem('active_outlet_id')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage if present
    const storedUser = localStorage.getItem('auth_user');
    const token = localStorage.getItem('access_token');

    if (storedUser && token) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.outletId && !activeOutletId) {
          setActiveOutletId(parsedUser.outletId);
          localStorage.setItem('active_outlet_id', parsedUser.outletId);
        }
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', credentials);
    const authData = response.data.data;
    
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));

    setUser(authData.user);
    if (authData.user.outletId) {
      setActiveOutletId(authData.user.outletId);
      localStorage.setItem('active_outlet_id', authData.user.outletId);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    window.location.href = '/login';
  };

  const setActiveOutlet = (outletId: string) => {
    setActiveOutletId(outletId);
    localStorage.setItem('active_outlet_id', outletId);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes('ADMIN')) return true;
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles?.includes(role) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeOutletId,
        login,
        logout,
        setActiveOutlet,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
