export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  active: boolean;
  roles: string[];
  permissions: string[];
  outletId?: string;
  outletName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}
