export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  permissions: PermissionItem[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRolePayload {
  description?: string;
  permissionIds: string[];
}
