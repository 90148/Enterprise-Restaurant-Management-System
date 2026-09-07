import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type {
  RestaurantTable,
  CreateTableFormData,
  UpdateTableFormData,
  TableStatus,
  TablePositionUpdate,
  TableStats,
} from '@/types/table';

export const tableApi = {
  getTables: async (params: { floorId?: string; outletId?: string }) => {
    const res = await apiClient.get<ApiResponse<RestaurantTable[]>>('/tables', { params });
    return res.data.data;
  },

  getTableStats: async (outletId: string) => {
    const res = await apiClient.get<ApiResponse<TableStats>>('/tables/stats', {
      params: { outletId },
    });
    return res.data.data;
  },

  getTableById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RestaurantTable>>(`/tables/${id}`);
    return res.data.data;
  },

  createTable: async (payload: CreateTableFormData) => {
    const res = await apiClient.post<ApiResponse<RestaurantTable>>('/tables', payload);
    return res.data.data;
  },

  updateTable: async (id: string, payload: UpdateTableFormData) => {
    const res = await apiClient.put<ApiResponse<RestaurantTable>>(`/tables/${id}`, payload);
    return res.data.data;
  },

  updateTableStatus: async (id: string, status: TableStatus) => {
    const res = await apiClient.patch<ApiResponse<RestaurantTable>>(`/tables/${id}/status`, { status });
    return res.data.data;
  },

  updateTablePositions: async (positions: TablePositionUpdate[]) => {
    const res = await apiClient.patch<ApiResponse<RestaurantTable[]>>('/tables/positions', positions);
    return res.data.data;
  },

  deleteTable: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/tables/${id}`);
    return res.data;
  },
};

export default tableApi;
