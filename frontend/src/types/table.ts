export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING';

export type TableShape = 'SQUARE' | 'ROUND' | 'RECTANGLE';

export interface RestaurantTable {
  id: string;
  floorId: string;
  floorName: string;
  floorNumber: number;
  outletId: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  shape: TableShape;
  posX: number;
  posY: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableFormData {
  floorId: string;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  posX?: number;
  posY?: number;
}

export interface UpdateTableFormData {
  floorId?: string;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  posX?: number;
  posY?: number;
  active?: boolean;
}

export interface TablePositionUpdate {
  id: string;
  posX: number;
  posY: number;
}

export interface TableStats {
  outletId: string;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  billingTables: number;
}
