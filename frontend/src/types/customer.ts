export type DietaryPreference = 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE' | 'SPICY';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethodType = 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'CASH' | 'COUNTER';
export type OrderStatusType = 'PLACED' | 'ACCEPTED' | 'KOT_GENERATED' | 'PREPARING' | 'READY' | 'SERVED' | 'DELIVERED' | 'CANCELLED';

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  apartment?: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  addresses: Address[];
  preferredOutletId?: string;
  preferredOrderType?: OrderType;
  dietaryPreferences: DietaryPreference[];
  favoriteDishIds: string[];
}

export interface OutletInfo {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  distanceKm: number;
  isOpen: boolean;
  openingHours: string;
  availableTables: number;
  totalTables: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  estimatedDeliveryMin: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  description?: string;
  minSelection: number;
  maxSelection: number;
  isRequired: boolean;
  options: ModifierOption[];
}

export interface FoodVariant {
  id: string;
  name: string; // e.g. "Small (6\")", "Medium (10\")", "Large (14\")" or "Single", "Full"
  price: number;
  priceDelta?: number;
  originalPrice?: number;
  isDefault?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  cuisine: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  isVeg: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  spiceLevel?: 0 | 1 | 2 | 3; // 0=None, 1=Mild, 2=Medium, 3=Hot
  isBestseller?: boolean;
  isChefSpecial?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  calories?: number;
  nutritionFacts?: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  allergens?: string[];
  ingredients?: string[];
  imageUrl: string;
  isAvailable: boolean;
  variants?: FoodVariant[];
  modifierGroups?: ModifierGroup[];
  tags?: string[];
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  imageUrl?: string;
  itemCount: number;
  isPopular?: boolean;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface FoodCustomization {
  selectedVariant?: FoodVariant;
  selectedModifiers: SelectedModifier[];
  spiceLevel?: number;
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string; // Unique string based on item id + customizations
  foodItem: FoodItem;
  customization: FoodCustomization;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  appliedCoupon?: Coupon;
  taxAmount: number;
  serviceChargeAmount: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validUntil: string;
  terms?: string[];
}

export interface TrackingStep {
  status: OrderStatusType;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface CustomerOrder {
  id: string;
  customerName?: string;
  customerPhone?: string;
  orderNumber: string;
  outletId: string;
  outletName: string;
  outletAddress: string;
  outletPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: Address;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceChargeAmount: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'REFUNDED';
  orderStatus: OrderStatusType;
  createdAt: string;
  estimatedDeliveryTime: string;
  trackingTimeline: TrackingStep[];
  specialInstructions?: string;
  isRated?: boolean;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMO' | 'TABLE' | 'INFO';
  timestamp: string;
  isRead: boolean;
  orderId?: string;
  actionUrl?: string;
}

export interface CustomerReview {
  id: string;
  orderId: string;
  customerName?: string;
  foodRating: number;
  serviceRating: number;
  experienceRating?: number;
  ambienceRating?: number;
  comment: string;
  itemRatings?: { [dishId: string]: boolean }; // true=like, false=dislike
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  tableNumber: string;
  outletId?: string;
  requestType: 'WAITER' | 'WATER' | 'BILL' | 'CLEAN';
  createdAt: string;
  timestamp?: string;
  status: 'PENDING' | 'RESOLVED' | 'ACKNOWLEDGED';
  notes?: string;
}

export interface SplitPerson {
  id: string;
  name: string;
  amount: number;
  isPaid?: boolean;
}

export interface BillSplit {
  orderId: string;
  totalAmount: number;
  splitType: 'EQUAL' | 'ITEM' | 'PERCENTAGE';
  persons: SplitPerson[];
}
