import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type {
  MenuCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  MenuItem,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  ModifierGroup,
  CreateModifierGroupPayload,
} from '@/types/menu';

export const menuApi = {
  // --- Categories ---
  getCategories: async (outletId: string, activeOnly?: boolean) => {
    const res = await apiClient.get<ApiResponse<MenuCategory[]>>('/menu/categories', {
      params: { outletId, activeOnly },
    });
    return res.data.data;
  },

  getCategoryById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<MenuCategory>>(`/menu/categories/${id}`);
    return res.data.data;
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    const res = await apiClient.post<ApiResponse<MenuCategory>>('/menu/categories', payload);
    return res.data.data;
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload) => {
    const res = await apiClient.put<ApiResponse<MenuCategory>>(`/menu/categories/${id}`, payload);
    return res.data.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/menu/categories/${id}`);
    return res.data;
  },

  // --- Menu Items ---
  getMenuItems: async (params?: {
    outletId?: string;
    categoryId?: string;
    available?: boolean;
    active?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
    direction?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<MenuItem>>>('/menu/items', { params });
    return res.data.data;
  },

  getMenuItemById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<MenuItem>>(`/menu/items/${id}`);
    return res.data.data;
  },

  createMenuItem: async (payload: CreateMenuItemPayload) => {
    const res = await apiClient.post<ApiResponse<MenuItem>>('/menu/items', payload);
    return res.data.data;
  },

  updateMenuItem: async (id: string, payload: UpdateMenuItemPayload) => {
    const res = await apiClient.put<ApiResponse<MenuItem>>(`/menu/items/${id}`, payload);
    return res.data.data;
  },

  updateAvailability: async (id: string, isAvailable: boolean) => {
    const res = await apiClient.patch<ApiResponse<MenuItem>>(`/menu/items/${id}/availability`, {
      isAvailable,
    });
    return res.data.data;
  },

  deleteMenuItem: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/menu/items/${id}`);
    return res.data;
  },

  // --- Modifiers ---
  getModifierGroups: async (outletId: string) => {
    const res = await apiClient.get<ApiResponse<ModifierGroup[]>>('/menu/modifiers', {
      params: { outletId },
    });
    return res.data.data;
  },

  createModifierGroup: async (payload: CreateModifierGroupPayload) => {
    const res = await apiClient.post<ApiResponse<ModifierGroup>>('/menu/modifiers', payload);
    return res.data.data;
  },

  updateModifierGroup: async (id: string, payload: CreateModifierGroupPayload) => {
    const res = await apiClient.put<ApiResponse<ModifierGroup>>(`/menu/modifiers/${id}`, payload);
    return res.data.data;
  },

  deleteModifierGroup: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/menu/modifiers/${id}`);
    return res.data;
  },
};

export default menuApi;
