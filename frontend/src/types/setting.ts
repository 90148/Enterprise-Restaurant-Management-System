export interface OutletSettings {
  outletId: string;
  restaurantName: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultServiceCharge: number;
  receiptHeader?: string;
  receiptFooter: string;
  taxNumber?: string;
  autoPrintReceipt: boolean;
  defaultOrderType: string;
  customSettings?: Record<string, string>;
}

export interface Tax {
  id: string;
  outletId: string;
  name: string;
  percentage: number;
  inclusive: boolean;
  active: boolean;
}

export interface CreateTaxRequest {
  outletId?: string;
  name: string;
  percentage: number;
  inclusive: boolean;
  active?: boolean;
}
