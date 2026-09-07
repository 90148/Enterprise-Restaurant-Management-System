import { OrderItemStatus, OrderType } from './order';

export type KotStatus = 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export type KitchenStation = 'ALL' | 'MAIN_KITCHEN' | 'PIZZA' | 'BAR' | 'DESSERT';

export interface KotItem {
  id: string;
  menuItemId?: string;
  orderItemId?: string;
  itemName: string;
  quantity: number;
  status: OrderItemStatus;
  modifiersSummary?: string;
  kitchenStation?: string;
  notes?: string;
  createdAt: string;
}

export interface KotTicket {
  id: string;
  outletId?: string;
  orderId: string;
  orderNumber: string;
  kotNumber: string;
  tableId?: string;
  tableNumber?: string;
  floorName?: string;
  customerName?: string;
  serverName?: string;
  orderType: OrderType;
  roundNumber: number;
  station?: string;
  status: KotStatus;
  notes?: string;
  items: KotItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  elapsedMinutes: number;
}

export interface UpdateKotStatusRequest {
  status: KotStatus;
  reason?: string;
}

export interface UpdateKotItemStatusRequest {
  status: OrderItemStatus;
}

export interface KotStats {
  totalToday: number;
  activeTickets: number;
  preparingTickets: number;
  readyTickets: number;
  delayedTickets: number;
}
