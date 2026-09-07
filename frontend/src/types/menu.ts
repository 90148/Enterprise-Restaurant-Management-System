export interface MenuCategory {
  id: string;
  outletId?: string;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  outletId: string;
  name: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface UpdateCategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  name: string;
  price: number;
  active: boolean;
}

export interface ModifierGroup {
  id: string;
  outletId?: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  active: boolean;
  modifiers: Modifier[];
}

export interface CreateModifierGroupPayload {
  outletId?: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  active?: boolean;
  modifiers?: {
    name: string;
    price: number;
    active?: boolean;
  }[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName: string;
  outletId?: string;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  taxRate: number;
  imageUrl?: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  specialInstructions?: string;
  active: boolean;
  profitMargin: number;
  hasRecipe: boolean;
  modifierGroups: ModifierGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  taxRate?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  prepTimeMinutes?: number;
  specialInstructions?: string;
  modifierGroupIds?: string[];
}

export interface UpdateMenuItemPayload {
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  taxRate?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  prepTimeMinutes?: number;
  specialInstructions?: string;
  active?: boolean;
  modifierGroupIds?: string[];
}
