import apiClient from './client';
import {
  Order,
  OrderStats,
  CreateOrderRequest,
  AddOrderItemsRequest,
  UpdateOrderStatusRequest,
  ApplyDiscountRequest,
  OrderFilterParams,
} from '@/types/order';
import { ApiResponse, PagedResponse } from '@/types/api';

export const getOrders = async (params: OrderFilterParams): Promise<PagedResponse<Order>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Order>>>('/orders', { params });
  return response.data.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  return response.data.data;
};

export const getActiveOrderByTable = async (outletId: string, tableId: string): Promise<Order> => {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/table/${tableId}/active`, {
    params: { outletId },
  });
  return response.data.data;
};

export const getOrderStats = async (outletId: string): Promise<OrderStats> => {
  const response = await apiClient.get<ApiResponse<OrderStats>>('/orders/stats', {
    params: { outletId },
  });
  return response.data.data;
};

export const createOrder = async (data: CreateOrderRequest): Promise<Order> => {
  const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
  return response.data.data;
};

export const addItemsToOrder = async (orderId: string, data: AddOrderItemsRequest): Promise<Order> => {
  const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/items`, data);
  return response.data.data;
};

export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderStatusRequest
): Promise<Order> => {
  const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, data);
  return response.data.data;
};

export const applyOrderDiscount = async (
  orderId: string,
  data: ApplyDiscountRequest
): Promise<Order> => {
  const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/discount`, data);
  return response.data.data;
};

export const cancelOrder = async (orderId: string, reason?: string): Promise<Order> => {
  const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, { reason });
  return response.data.data;
};
