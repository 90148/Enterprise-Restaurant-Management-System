import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { OutletItem, CreateOutletPayload, UpdateOutletPayload } from '@/types/outlet';

export const outletApi = {
  getOutlets: async (params?: {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<OutletItem>>>('/outlets', { params });
    return res.data.data;
  },

  getActiveOutlets: async () => {
    const res = await apiClient.get<ApiResponse<OutletItem[]>>('/outlets/active');
    return res.data.data;
  },

  getOutletById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<OutletItem>>(`/outlets/${id}`);
    return res.data.data;
  },

  createOutlet: async (payload: CreateOutletPayload) => {
    const res = await apiClient.post<ApiResponse<OutletItem>>('/outlets', payload);
    return res.data.data;
  },

  updateOutlet: async (id: string, payload: UpdateOutletPayload) => {
    const res = await apiClient.put<ApiResponse<OutletItem>>(`/outlets/${id}`, payload);
    return res.data.data;
  },

  updateOutletStatus: async (id: string, active: boolean) => {
    const res = await apiClient.patch<ApiResponse<OutletItem>>(`/outlets/${id}/status`, { active });
    return res.data.data;
  },

  deleteOutlet: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/outlets/${id}`);
    return res.data;
  },
};

export default outletApi;
