import { OrderType } from './order';

export type BillStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'WALLET';

export type PaymentStatus = 'SUCCESS' | 'REFUNDED' | 'FAILED';

export interface BillItem {
  id: string;
  orderItemId?: string;
  menuItemId?: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  modifiersSummary?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  outletId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  tenderedAmount?: number;
  changeAmount?: number;
  transactionRef?: string;
  status: PaymentStatus;
  notes?: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  outletId: string;
  outletName: string;
  orderId: string;
  orderNumber: string;
  billNumber: string;
  tableId?: string;
  tableNumber?: string;
  floorName?: string;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: BillStatus;
  notes?: string;
  items: BillItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcessPaymentRequest {
  amount: number;
  tenderedAmount?: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export interface BillingStats {
  totalBillsToday: number;
  unpaidBills: number;
  paidBills: number;
  todayRevenue: number;
}

export interface BillFilterParams {
  outletId: string;
  status?: BillStatus;
  search?: string;
  page?: number;
  size?: number;
}
