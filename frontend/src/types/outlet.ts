export interface OutletItem {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  openingTime?: string;
  closingTime?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutletPayload {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  openingTime?: string;
  closingTime?: string;
}

export interface UpdateOutletPayload {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  openingTime?: string;
  closingTime?: string;
}
