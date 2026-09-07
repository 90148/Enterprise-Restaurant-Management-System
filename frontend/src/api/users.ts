import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { UserItem, CreateUserPayload, UpdateUserPayload } from '@/types/user';

export const userApi = {
  getUsers: async (params?: {
    search?: string;
    active?: boolean;
    outletId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<UserItem>>>('/users', { params });
    return res.data.data;
  },

  getUserById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<UserItem>>(`/users/${id}`);
    return res.data.data;
  },

  createUser: async (payload: CreateUserPayload) => {
    const res = await apiClient.post<ApiResponse<UserItem>>('/users', payload);
    return res.data.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload) => {
    const res = await apiClient.put<ApiResponse<UserItem>>(`/users/${id}`, payload);
    return res.data.data;
  },

  updateUserStatus: async (id: string, active: boolean) => {
    const res = await apiClient.patch<ApiResponse<UserItem>>(`/users/${id}/status`, { active });
    return res.data.data;
  },

  deleteUser: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return res.data;
  },
};

export default userApi;
