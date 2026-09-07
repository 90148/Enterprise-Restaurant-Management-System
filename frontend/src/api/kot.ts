import apiClient from './client';
import {
  KotTicket,
  KotStats,
  UpdateKotStatusRequest,
  UpdateKotItemStatusRequest,
} from '@/types/kot';
import { ApiResponse } from '@/types/api';

export const getActiveTickets = async (
  outletId: string,
  station?: string
): Promise<KotTicket[]> => {
  const params: Record<string, string> = { outletId };
  if (station && station !== 'ALL') {
    params.station = station;
  }
  const response = await apiClient.get<ApiResponse<KotTicket[]>>('/kds/tickets', { params });
  return response.data.data;
};

export const getTicketById = async (id: string): Promise<KotTicket> => {
  const response = await apiClient.get<ApiResponse<KotTicket>>(`/kds/tickets/${id}`);
  return response.data.data;
};

export const getTicketsByOrderId = async (orderId: string): Promise<KotTicket[]> => {
  const response = await apiClient.get<ApiResponse<KotTicket[]>>(`/kds/order/${orderId}`);
  return response.data.data;
};

export const getKitchenStats = async (outletId: string): Promise<KotStats> => {
  const response = await apiClient.get<ApiResponse<KotStats>>('/kds/stats', {
    params: { outletId },
  });
  return response.data.data;
};

export const updateTicketStatus = async (
  id: string,
  data: UpdateKotStatusRequest
): Promise<KotTicket> => {
  const response = await apiClient.patch<ApiResponse<KotTicket>>(`/kds/tickets/${id}/status`, data);
  return response.data.data;
};

export const updateTicketItemStatus = async (
  itemId: string,
  data: UpdateKotItemStatusRequest
): Promise<KotTicket> => {
  const response = await apiClient.patch<ApiResponse<KotTicket>>(`/kds/items/${itemId}/status`, data);
  return response.data.data;
};

export const recallLastBumpedTicket = async (outletId: string): Promise<KotTicket> => {
  const response = await apiClient.post<ApiResponse<KotTicket>>('/kds/recall', null, {
    params: { outletId },
  });
  return response.data.data;
};
