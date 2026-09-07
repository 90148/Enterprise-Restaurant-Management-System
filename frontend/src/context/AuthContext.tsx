import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, AuthResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
import apiClient from '@/api/client';
import tokenService from '@/services/tokenService';

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
  const [user, setUser] = useState<User | null>(tokenService.getUser());
  const [activeOutletId, setActiveOutletId] = useState<string | null>(
    tokenService.getActiveOutletId()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenService.getAccessToken();
      const storedUser = tokenService.getUser();

      if (token && storedUser) {
        if (tokenService.isTokenExpired(token)) {
          // Token expired, attempt silent refresh
          const refreshToken = tokenService.getRefreshToken();
          if (refreshToken) {
            try {
              const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
                refreshToken,
              });
              const authData = res.data.data;
              tokenService.setAccessToken(authData.accessToken);
              tokenService.setRefreshToken(authData.refreshToken);
              tokenService.setUser(authData.user);
              setUser(authData.user);
            } catch {
              tokenService.clearSession();
              setUser(null);
            }
          } else {
            tokenService.clearSession();
            setUser(null);
          }
        } else {
          setUser(storedUser);
          if (storedUser.outletId && !activeOutletId) {
            setActiveOutletId(storedUser.outletId);
            tokenService.setActiveOutletId(storedUser.outletId);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const authData = response.data.data;

    tokenService.setAccessToken(authData.accessToken);
    tokenService.setRefreshToken(authData.refreshToken);
    tokenService.setUser(authData.user);

    setUser(authData.user);
    if (authData.user.outletId) {
      setActiveOutletId(authData.user.outletId);
      tokenService.setActiveOutletId(authData.user.outletId);
    }
  };

  const logout = () => {
    const refreshToken = tokenService.getRefreshToken();
    if (refreshToken) {
      // Best effort backend revocation
      apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    tokenService.clearSession();
    setUser(null);
    window.location.href = '/login';
  };

  const setActiveOutlet = (outletId: string) => {
    setActiveOutletId(outletId);
    tokenService.setActiveOutletId(outletId);
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
