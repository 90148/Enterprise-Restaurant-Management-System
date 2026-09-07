import apiClient from './client';
import { ApiResponse } from '@/types/api';
import {
  DashboardStats,
  SalesSummary,
  DailySales,
  HourlySales,
  PaymentMethodSummary,
  OrderTypeSummary,
  TopSellingItem,
  CategorySales,
  InventoryConsumptionSummary,
} from '@/types/report';

export interface ReportDateParams {
  outletId?: string;
  startDate?: string;
  endDate?: string;
}

export const getDashboardStats = async (outletId?: string): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/reports/dashboard/stats', {
    params: { outletId },
  });
  return response.data.data;
};

export const getSalesSummary = async (params?: ReportDateParams): Promise<SalesSummary> => {
  const response = await apiClient.get<ApiResponse<SalesSummary>>('/reports/sales/summary', {
    params,
  });
  return response.data.data;
};

export const getDailySales = async (params?: ReportDateParams): Promise<DailySales[]> => {
  const response = await apiClient.get<ApiResponse<DailySales[]>>('/reports/sales/daily', {
    params,
  });
  return response.data.data;
};

export const getHourlySales = async (date?: string, outletId?: string): Promise<HourlySales[]> => {
  const response = await apiClient.get<ApiResponse<HourlySales[]>>('/reports/sales/hourly', {
    params: { date, outletId },
  });
  return response.data.data;
};

export const getPaymentMethodBreakdown = async (params?: ReportDateParams): Promise<PaymentMethodSummary[]> => {
  const response = await apiClient.get<ApiResponse<PaymentMethodSummary[]>>('/reports/sales/payment-methods', {
    params,
  });
  return response.data.data;
};

export const getOrderTypeBreakdown = async (params?: ReportDateParams): Promise<OrderTypeSummary[]> => {
  const response = await apiClient.get<ApiResponse<OrderTypeSummary[]>>('/reports/sales/order-types', {
    params,
  });
  return response.data.data;
};

export const getTopSellingItems = async (params?: ReportDateParams & { limit?: number }): Promise<TopSellingItem[]> => {
  const response = await apiClient.get<ApiResponse<TopSellingItem[]>>('/reports/items/top-selling', {
    params,
  });
  return response.data.data;
};

export const getCategorySales = async (params?: ReportDateParams): Promise<CategorySales[]> => {
  const response = await apiClient.get<ApiResponse<CategorySales[]>>('/reports/categories/performance', {
    params,
  });
  return response.data.data;
};

export const getInventoryConsumption = async (params?: ReportDateParams): Promise<InventoryConsumptionSummary[]> => {
  const response = await apiClient.get<ApiResponse<InventoryConsumptionSummary[]>>('/reports/inventory/consumption', {
    params,
  });
  return response.data.data;
};

export const downloadSalesReportCsv = async (params?: ReportDateParams): Promise<void> => {
  const response = await apiClient.get('/reports/sales/export', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `sales-report-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
