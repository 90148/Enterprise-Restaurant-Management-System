export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItemModifier {
  id: string;
  modifierId?: string;
  modifierName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId?: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  status: OrderItemStatus;
  notes?: string;
  modifiers: OrderItemModifier[];
  createdAt: string;
}

export interface Order {
  id: string;
  outletId: string;
  outletName: string;
  orderNumber: string;
  tableId?: string;
  tableNumber?: string;
  floorName?: string;
  customerName?: string;
  customerPhone?: string;
  guestCount?: number;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdById?: string;
  createdByName?: string;
  items: OrderItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  notes?: string;
  selectedModifierIds?: string[];
}

export interface CreateOrderRequest {
  outletId: string;
  tableId?: string;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  guestCount?: number;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface AddOrderItemsRequest {
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

export interface ApplyDiscountRequest {
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  reason?: string;
}

export interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface OrderFilterParams {
  outletId: string;
  status?: OrderStatus;
  orderType?: OrderType;
  search?: string;
  page?: number;
  size?: number;
}
