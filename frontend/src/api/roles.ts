import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { RoleItem, PermissionItem, CreateRolePayload, UpdateRolePayload } from '@/types/role';

export const roleApi = {
  getRoles: async () => {
    const res = await apiClient.get<ApiResponse<RoleItem[]>>('/roles');
    return res.data.data;
  },

  getRoleById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RoleItem>>(`/roles/${id}`);
    return res.data.data;
  },

  createRole: async (payload: CreateRolePayload) => {
    const res = await apiClient.post<ApiResponse<RoleItem>>('/roles', payload);
    return res.data.data;
  },

  updateRole: async (id: string, payload: UpdateRolePayload) => {
    const res = await apiClient.put<ApiResponse<RoleItem>>(`/roles/${id}`, payload);
    return res.data.data;
  },

  deleteRole: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/roles/${id}`);
    return res.data;
  },

  getPermissions: async () => {
    const res = await apiClient.get<ApiResponse<PermissionItem[]>>('/permissions');
    return res.data.data;
  },

  getGroupedPermissions: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, PermissionItem[]>>>('/permissions/grouped');
    return res.data.data;
  },
};

export default roleApi;
