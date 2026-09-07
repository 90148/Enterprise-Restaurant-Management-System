import apiClient from './client';
import { ApiResponse } from '@/types/api';
import { OutletSettings, Tax, CreateTaxRequest } from '@/types/setting';

export const getOutletSettings = async (outletId?: string): Promise<OutletSettings> => {
  const response = await apiClient.get<ApiResponse<OutletSettings>>('/settings', {
    params: { outletId },
  });
  return response.data.data;
};

export const updateOutletSettings = async (
  settings: Partial<OutletSettings>,
  outletId?: string
): Promise<OutletSettings> => {
  const response = await apiClient.post<ApiResponse<OutletSettings>>('/settings', settings, {
    params: { outletId },
  });
  return response.data.data;
};

export const getTaxes = async (outletId?: string): Promise<Tax[]> => {
  const response = await apiClient.get<ApiResponse<Tax[]>>('/taxes', {
    params: { outletId },
  });
  return response.data.data;
};

export const createTax = async (tax: CreateTaxRequest): Promise<Tax> => {
  const response = await apiClient.post<ApiResponse<Tax>>('/taxes', tax);
  return response.data.data;
};

export const updateTax = async (id: string, tax: Partial<CreateTaxRequest>): Promise<Tax> => {
  const response = await apiClient.put<ApiResponse<Tax>>(`/taxes/${id}`, tax);
  return response.data.data;
};

export const deleteTax = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/taxes/${id}`);
};
