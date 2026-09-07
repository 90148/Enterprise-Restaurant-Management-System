import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Recipe, SaveRecipePayload, InventoryItemSummary } from '@/types/recipe';

export const recipeApi = {
  getRecipeByMenuItem: async (menuItemId: string) => {
    const res = await apiClient.get<ApiResponse<Recipe>>(`/menu/recipes/item/${menuItemId}`);
    return res.data.data;
  },

  saveRecipe: async (payload: SaveRecipePayload) => {
    const res = await apiClient.post<ApiResponse<Recipe>>('/menu/recipes', payload);
    return res.data.data;
  },

  deleteRecipe: async (menuItemId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/menu/recipes/item/${menuItemId}`);
    return res.data;
  },

  getAvailableIngredients: async (outletId: string) => {
    const res = await apiClient.get<ApiResponse<InventoryItemSummary[]>>('/menu/recipes/ingredients', {
      params: { outletId },
    });
    return res.data.data;
  },
};

export default recipeApi;
