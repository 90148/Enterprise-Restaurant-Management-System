export type InventoryStatus = 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type InventoryTransactionType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'WASTE' | 'TRANSFER';

export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface InventoryItem {
  id: string;
  outletId: string;
  name: string;
  sku: string;
  unitId: string;
  unitName: string;
  unitSymbol: string;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unitSymbol: string;
  transactionType: InventoryTransactionType;
  quantityChanged: number;
  remainingStock: number;
  referenceId?: string;
  notes?: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValuation: number;
  todayPurchasesCount: number;
  todayRefundsTotal: number;
}

export interface AdjustStockRequest {
  quantityDelta: number;
  type?: InventoryTransactionType;
  reason?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  sku: string;
  unitSymbol: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  createdAt?: string;
}

export interface PurchaseOrder {
  id: string;
  outletId: string;
  outletName?: string;
  poNumber: string;
  supplierName: string;
  supplierContact?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  notes?: string;
  createdByName?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderItemRequest {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderRequest {
  outletId: string;
  supplierName: string;
  supplierContact?: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface RefundTransaction {
  id: string;
  paymentId: string;
  billId?: string;
  billNumber?: string;
  amount: number;
  paymentMethod?: string;
  reason: string;
  status: string;
  createdByName?: string;
  createdAt: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface InventoryFilterParams {
  outletId: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface PurchaseOrderFilterParams {
  outletId: string;
  status?: PurchaseOrderStatus;
  search?: string;
  page?: number;
  size?: number;
}
