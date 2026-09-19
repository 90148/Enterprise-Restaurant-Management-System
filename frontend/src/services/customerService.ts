import {
  FoodCategory,
  FoodItem,
  OutletInfo,
  Coupon,
  CustomerOrder,
  CustomerProfile,
  CustomerReview,
  ServiceRequest,
  DietaryPreference,
} from '@/types/customer';
import {
  SAMPLE_OUTLETS,
  SAMPLE_CATEGORIES,
  SAMPLE_MENU_ITEMS,
  SAMPLE_COUPONS,
  INITIAL_CUSTOMER_PROFILE,
} from './customerMenuData';
import axios from 'axios';

const STORAGE_KEYS = {
  PROFILE: 'restomaster_customer_profile',
  ORDERS: 'restomaster_customer_orders',
  ACTIVE_OUTLET: 'restomaster_active_outlet_id',
  FAVORITES: 'restomaster_customer_favorites',
  ACTIVE_TABLE: 'restomaster_active_table',
};

// 1. Outlet Services
export const getOutlets = async (): Promise<OutletInfo[]> => {
  try {
    const res = await axios.get('/api/outlets', { timeout: 3000 });
    if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      // Map backend outlets and enrich with customer distance / image data
      return res.data.data.map((o: any, idx: number) => ({
        id: o.id,
        name: o.name,
        code: o.code || `OUT-0${idx + 1}`,
        address: o.address || 'Central Boulevard',
        city: o.city || 'Chennai',
        phone: o.phone || '+91 44 2833 4900',
        distanceKm: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.distanceKm || 2.0,
        isOpen: o.active !== false,
        openingHours: '11:00 AM – 11:30 PM',
        availableTables: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.availableTables || 12,
        totalTables: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.totalTables || 25,
        deliveryAvailable: true,
        pickupAvailable: true,
        rating: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.rating || 4.8,
        reviewCount: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.reviewCount || 850,
        imageUrl: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.imageUrl || SAMPLE_OUTLETS[0].imageUrl,
        estimatedDeliveryMin: SAMPLE_OUTLETS[idx % SAMPLE_OUTLETS.length]?.estimatedDeliveryMin || 30,
      }));
    }
  } catch {
    // Graceful offline fallback
  }
  return SAMPLE_OUTLETS;
};

export const getOutletById = async (outletId: string): Promise<OutletInfo> => {
  const outlets = await getOutlets();
  const found = outlets.find((o) => o.id === outletId);
  return found || outlets[0];
};

// 2. Category & Menu Services
export const getCategories = async (): Promise<FoodCategory[]> => {
  try {
    const res = await axios.get('/api/menu/categories', { timeout: 3000 });
    if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const backendCats = res.data.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.name.toLowerCase().replace(/\s+/g, '-'),
        iconName: 'Utensils',
        itemCount: 8,
        isPopular: true,
      }));
      return [{ id: 'all', name: 'All Dishes', slug: 'all', iconName: 'Utensils', itemCount: 32, isPopular: true }, ...backendCats];
    }
  } catch {
    // Fallback to sample categories
  }
  return SAMPLE_CATEGORIES;
};

export interface MenuFilterParams {
  categoryId?: string;
  searchQuery?: string;
  dietary?: DietaryPreference[];
  priceRange?: [number, number];
  minRating?: number;
  onlyAvailable?: boolean;
  sortBy?: 'popular' | 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'prep_time';
}

export const getMenuItems = async (filters?: MenuFilterParams): Promise<FoodItem[]> => {
  let items = [...SAMPLE_MENU_ITEMS];

  if (!filters) return items;

  // Category filter
  if (filters.categoryId && filters.categoryId !== 'all') {
    items = items.filter((item) => item.categoryId.toLowerCase() === filters.categoryId!.toLowerCase());
  }

  // Search filter
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.cuisine.toLowerCase().includes(query) ||
        (item.ingredients && item.ingredients.some((ing) => ing.toLowerCase().includes(query))) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }

  // Dietary filter
  if (filters.dietary && filters.dietary.length > 0) {
    if (filters.dietary.includes('VEG')) {
      items = items.filter((item) => item.isVeg);
    }
    if (filters.dietary.includes('NON_VEG')) {
      items = items.filter((item) => !item.isVeg);
    }
    if (filters.dietary.includes('SPICY')) {
      items = items.filter((item) => item.isSpicy);
    }
  }

  // Price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    items = items.filter((item) => item.price >= min && (max === Infinity || item.price <= max));
  }

  // Rating filter
  if (filters.minRating && filters.minRating > 0) {
    items = items.filter((item) => item.rating >= filters.minRating!);
  }

  // Availability
  if (filters.onlyAvailable) {
    items = items.filter((item) => item.isAvailable);
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'popular':
        items.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'recommended':
        items.sort((a, b) => ((b.isChefSpecial ? 1 : 0) + (b.isBestseller ? 1 : 0)) - ((a.isChefSpecial ? 1 : 0) + (a.isBestseller ? 1 : 0)));
        break;
      case 'price_asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'prep_time':
        items.sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes);
        break;
    }
  }

  return items;
};

export const getMenuItemById = async (id: string): Promise<FoodItem | undefined> => {
  return SAMPLE_MENU_ITEMS.find((item) => item.id === id);
};

export const getPopularItems = async (): Promise<FoodItem[]> => {
  return SAMPLE_MENU_ITEMS.filter((item) => item.isBestseller).slice(0, 8);
};

export const getChefSpecials = async (): Promise<FoodItem[]> => {
  return SAMPLE_MENU_ITEMS.filter((item) => item.isChefSpecial).slice(0, 6);
};

export const getCombos = async (): Promise<FoodItem[]> => {
  return SAMPLE_MENU_ITEMS.filter((item) => item.categoryId === 'combos');
};

// 3. Coupons
export const getCoupons = async (): Promise<Coupon[]> => {
  return SAMPLE_COUPONS;
};

export const validateCoupon = (code: string, orderSubtotal: number): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } => {
  const coupon = SAMPLE_COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid promo code. Please check and try again.' };
  }
  if (orderSubtotal < coupon.minOrderAmount) {
    return { valid: false, discountAmount: 0, message: `Add items worth ₹${coupon.minOrderAmount - orderSubtotal} more to apply ${coupon.code}.` };
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return {
    valid: true,
    discountAmount: Math.min(discount, orderSubtotal),
    message: `Woohoo! ${coupon.code} applied. You saved ₹${discount}!`,
    coupon,
  };
};

// 4. Customer Profile & Orders Persistence
export const getCustomerProfile = (): CustomerProfile => {
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  return INITIAL_CUSTOMER_PROFILE;
};

export const saveCustomerProfile = (profile: CustomerProfile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getCustomerOrders = (): CustomerOrder[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const getCustomerOrderById = (orderId: string): CustomerOrder | undefined => {
  const orders = getCustomerOrders();
  return orders.find((o) => o.id === orderId);
};

export const saveCustomerOrder = (order: CustomerOrder): void => {
  const orders = getCustomerOrders();
  const existingIndex = orders.findIndex((o) => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const submitCustomerReview = (review: CustomerReview): void => {
  const orders = getCustomerOrders();
  const order = orders.find((o) => o.id === review.orderId);
  if (order) {
    order.isRated = true;
    saveCustomerOrder(order);
  }
};

export const submitServiceRequest = (req: ServiceRequest): void => {
  const stored = localStorage.getItem('restomaster_service_requests') || '[]';
  try {
    const list = JSON.parse(stored);
    list.unshift(req);
    localStorage.setItem('restomaster_service_requests', JSON.stringify(list));
  } catch {
    // Ignore
  }
};
