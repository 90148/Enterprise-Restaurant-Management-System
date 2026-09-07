export interface RecipeItem {
  id: string;
  inventoryItemId: string;
  ingredientName: string;
  sku: string;
  quantity: number;
  unitName: string;
  unitSymbol: string;
  unitCost: number;
  totalCost: number;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemPrice: number;
  instructions?: string;
  items: RecipeItem[];
  totalCost: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredientInput {
  inventoryItemId: string;
  quantity: number;
}

export interface SaveRecipePayload {
  menuItemId: string;
  instructions?: string;
  ingredients: RecipeIngredientInput[];
}

export interface InventoryItemSummary {
  id: string;
  name: string;
  sku: string;
  unitName: string;
  unitSymbol: string;
  currentStock: number;
  unitCost: number;
}
