export interface UserItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  outletId?: string;
  outletName?: string;
  active: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  outletId?: string;
  roles: string[];
}

export interface UpdateUserPayload {
  email: string;
  fullName: string;
  phone?: string;
  outletId?: string;
  roles: string[];
  password?: string;
}
