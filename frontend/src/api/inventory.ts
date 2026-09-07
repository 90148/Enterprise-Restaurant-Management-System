import apiClient from './client';
import {
  InventoryItem,
  InventoryTransaction,
  InventoryStats,
  AdjustStockRequest,
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  RefundTransaction,
  RefundRequest,
  InventoryFilterParams,
  PurchaseOrderFilterParams,
} from '@/types/inventory';
import { ApiResponse, PagedResponse } from '@/types/api';

// Inventory Items
export const getInventoryItems = async (
  params: InventoryFilterParams
): Promise<PagedResponse<InventoryItem>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<InventoryItem>>>('/inventory/items', { params });
  return response.data.data;
};

export const getInventoryItem = async (id: string): Promise<InventoryItem> => {
  const response = await apiClient.get<ApiResponse<InventoryItem>>(`/inventory/items/${id}`);
  return response.data.data;
};

export const getLowStockItems = async (outletId: string): Promise<InventoryItem[]> => {
  const response = await apiClient.get<ApiResponse<InventoryItem[]>>('/inventory/low-stock', {
    params: { outletId },
  });
  return response.data.data;
};

export const adjustStock = async (
  id: string,
  data: AdjustStockRequest
): Promise<InventoryItem> => {
  const response = await apiClient.post<ApiResponse<InventoryItem>>(`/inventory/items/${id}/adjust`, data);
  return response.data.data;
};

export const getItemTransactions = async (itemId: string): Promise<InventoryTransaction[]> => {
  const response = await apiClient.get<ApiResponse<InventoryTransaction[]>>(`/inventory/items/${itemId}/transactions`);
  return response.data.data;
};

export const getOutletTransactions = async (
  outletId: string,
  page = 0,
  size = 20
): Promise<PagedResponse<InventoryTransaction>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<InventoryTransaction>>>('/inventory/transactions', {
    params: { outletId, page, size },
  });
  return response.data.data;
};

export const getInventoryStats = async (outletId: string): Promise<InventoryStats> => {
  const response = await apiClient.get<ApiResponse<InventoryStats>>('/inventory/stats', {
    params: { outletId },
  });
  return response.data.data;
};

// Purchase Orders
export const createPurchaseOrder = async (
  data: CreatePurchaseOrderRequest
): Promise<PurchaseOrder> => {
  const response = await apiClient.post<ApiResponse<PurchaseOrder>>('/purchases', data);
  return response.data.data;
};

export const receivePurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  const response = await apiClient.post<ApiResponse<PurchaseOrder>>(`/purchases/${id}/receive`);
  return response.data.data;
};

export const getPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  const response = await apiClient.get<ApiResponse<PurchaseOrder>>(`/purchases/${id}`);
  return response.data.data;
};

export const getPurchaseOrders = async (
  params: PurchaseOrderFilterParams
): Promise<PagedResponse<PurchaseOrder>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<PurchaseOrder>>>('/purchases', { params });
  return response.data.data;
};

// Refunds
export const processRefund = async (data: RefundRequest): Promise<RefundTransaction> => {
  const response = await apiClient.post<ApiResponse<RefundTransaction>>('/refunds', data);
  return response.data.data;
};

export const getRefundsByOutlet = async (outletId: string): Promise<RefundTransaction[]> => {
  const response = await apiClient.get<ApiResponse<RefundTransaction[]>>('/refunds', {
    params: { outletId },
  });
  return response.data.data;
};

export const getRefundsByPayment = async (paymentId: string): Promise<RefundTransaction[]> => {
  const response = await apiClient.get<ApiResponse<RefundTransaction[]>>(`/refunds/payment/${paymentId}`);
  return response.data.data;
};
