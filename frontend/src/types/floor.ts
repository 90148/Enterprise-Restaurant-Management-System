export interface Floor {
  id: string;
  outletId: string;
  outletName: string;
  name: string;
  floorNumber: number;
  active: boolean;
  tableCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFloorFormData {
  outletId: string;
  name: string;
  floorNumber: number;
  active?: boolean;
}

export interface UpdateFloorFormData {
  name: string;
  floorNumber: number;
  active?: boolean;
}
