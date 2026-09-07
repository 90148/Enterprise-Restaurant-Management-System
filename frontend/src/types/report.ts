import { InventoryItemSummary } from './inventory';

export interface HourlySales {
  hour: number;
  label: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardStats {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueTrendPercent: number;
  activeTables: number;
  totalTables: number;
  availableTables: number;
  liveOrders: number;
  todayCompletedOrders: number;
  ordersTrendPercent: number;
  hourlyTrend: HourlySales[];
  lowStockAlerts: InventoryItemSummary[];
}

export interface SalesSummary {
  grossSales: number;
  discountTotal: number;
  netSales: number;
  taxTotal: number;
  totalPaid: number;
  totalRefunds: number;
  totalOrders: number;
  totalBills: number;
  averageOrderValue: number;
}

export interface DailySales {
  date: string;
  grossSales: number;
  netSales: number;
  taxAmount: number;
  discountAmount: number;
  paidAmount: number;
  orderCount: number;
}

export interface PaymentMethodSummary {
  paymentMethod: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface OrderTypeSummary {
  orderType: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface TopSellingItem {
  menuItemId: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  revenueSharePercentage: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  itemsSold: number;
  totalRevenue: number;
  revenueSharePercentage: number;
}

export interface InventoryConsumptionSummary {
  transactionType: string;
  count: number;
  totalQuantity: number;
}
