import apiClient from './client';
import {
  Bill,
  BillingStats,
  ProcessPaymentRequest,
  BillFilterParams,
} from '@/types/billing';
import { ApiResponse, PagedResponse } from '@/types/api';

export const generateBill = async (orderId: string): Promise<Bill> => {
  const response = await apiClient.post<ApiResponse<Bill>>(`/bills/order/${orderId}`);
  return response.data.data;
};

export const getBillById = async (id: string): Promise<Bill> => {
  const response = await apiClient.get<ApiResponse<Bill>>(`/bills/${id}`);
  return response.data.data;
};

export const getBillByOrderId = async (orderId: string): Promise<Bill> => {
  const response = await apiClient.get<ApiResponse<Bill>>(`/bills/order/${orderId}`);
  return response.data.data;
};

export const getBills = async (params: BillFilterParams): Promise<PagedResponse<Bill>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Bill>>>('/bills', { params });
  return response.data.data;
};

export const getBillingStats = async (outletId: string): Promise<BillingStats> => {
  const response = await apiClient.get<ApiResponse<BillingStats>>('/bills/stats', {
    params: { outletId },
  });
  return response.data.data;
};

export const processPayment = async (
  billId: string,
  data: ProcessPaymentRequest
): Promise<Bill> => {
  const response = await apiClient.post<ApiResponse<Bill>>(`/bills/${billId}/payments`, data);
  return response.data.data;
};
