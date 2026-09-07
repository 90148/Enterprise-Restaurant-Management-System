import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Floor, CreateFloorFormData, UpdateFloorFormData } from '@/types/floor';

export const floorApi = {
  getFloorsByOutlet: async (outletId: string, activeOnly?: boolean) => {
    const res = await apiClient.get<ApiResponse<Floor[]>>('/floors', {
      params: { outletId, activeOnly },
    });
    return res.data.data;
  },

  getFloorById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Floor>>(`/floors/${id}`);
    return res.data.data;
  },

  createFloor: async (payload: CreateFloorFormData) => {
    const res = await apiClient.post<ApiResponse<Floor>>('/floors', payload);
    return res.data.data;
  },

  updateFloor: async (id: string, payload: UpdateFloorFormData) => {
    const res = await apiClient.put<ApiResponse<Floor>>(`/floors/${id}`, payload);
    return res.data.data;
  },

  deleteFloor: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/floors/${id}`);
    return res.data;
  },
};

export default floorApi;
