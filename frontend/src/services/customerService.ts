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
  OrderStatusType,
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
  MENU_ITEMS: 'restomaster_customer_menu_items',
  CATEGORIES: 'restomaster_customer_categories',
  COUPONS: 'restomaster_customer_coupons',
  SERVICE_REQUESTS: 'restomaster_service_requests',
  REVIEWS: 'restomaster_customer_reviews',
};

// Event broadcaster for cross-component / cross-tab reactivity
export const notifyCustomerDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('restomaster_customer_data_updated'));
  }
};

// 1. Outlet Services
export const getOutlets = async (): Promise<OutletInfo[]> => {
  try {
    const res = await axios.get('/api/outlets', { timeout: 3000 });
    if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
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

// 2. Category Services & Admin Management
export const getStoredCategories = (): FoodCategory[] => {
  if (typeof window === 'undefined') return SAMPLE_CATEGORIES;
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SAMPLE_CATEGORIES));
  return SAMPLE_CATEGORIES;
};

export const saveCategories = (categories: FoodCategory[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  notifyCustomerDataChanged();
};

export const getCategories = async (): Promise<FoodCategory[]> => {
  return getStoredCategories();
};

export const addCustomerCategory = (categoryData: Omit<FoodCategory, 'id' | 'slug' | 'itemCount'> & { slug?: string; itemCount?: number }): FoodCategory => {
  const cats = getStoredCategories();
  const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const id = `cat-${Date.now()}`;
  const newCat: FoodCategory = {
    ...categoryData,
    id,
    slug,
    itemCount: categoryData.itemCount || 0,
  };
  cats.push(newCat);
  saveCategories(cats);
  return newCat;
};

export const updateCustomerCategory = (id: string, updates: Partial<FoodCategory>): FoodCategory => {
  const cats = getStoredCategories();
  const index = cats.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Category not found');
  cats[index] = { ...cats[index], ...updates };
  saveCategories(cats);
  return cats[index];
};

export const deleteCustomerCategory = (id: string): void => {
  if (id === 'all') return; // Cannot delete system root category
  const cats = getStoredCategories().filter((c) => c.id !== id);
  saveCategories(cats);
};

// 3. Menu Items Services & Admin Management
export const getStoredMenuItems = (): FoodItem[] => {
  if (typeof window === 'undefined') return SAMPLE_MENU_ITEMS;
  const stored = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(SAMPLE_MENU_ITEMS));
  return SAMPLE_MENU_ITEMS;
};

export const saveMenuItems = (items: FoodItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  // Recalculate category item counts
  const categories = getStoredCategories();
  const updatedCategories = categories.map((cat) => {
    if (cat.id === 'all') {
      return { ...cat, itemCount: items.length };
    }
    const count = items.filter((i) => i.categoryId.toLowerCase() === cat.id.toLowerCase()).length;
    return { ...cat, itemCount: count };
  });
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
  notifyCustomerDataChanged();
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
  let items = [...getStoredMenuItems()];

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
        items.sort(
          (a, b) =>
            ((b.isChefSpecial ? 1 : 0) + (b.isBestseller ? 1 : 0)) -
            ((a.isChefSpecial ? 1 : 0) + (a.isBestseller ? 1 : 0))
        );
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
  return getStoredMenuItems().find((item) => item.id === id);
};

export const getPopularItems = async (): Promise<FoodItem[]> => {
  return getStoredMenuItems().filter((item) => item.isBestseller).slice(0, 8);
};

export const getChefSpecials = async (): Promise<FoodItem[]> => {
  return getStoredMenuItems().filter((item) => item.isChefSpecial).slice(0, 6);
};

export const getCombos = async (): Promise<FoodItem[]> => {
  return getStoredMenuItems().filter((item) => item.categoryId === 'combos');
};

// Admin Menu Item Operations
export const addCustomerMenuItem = (itemData: Omit<FoodItem, 'id'>): FoodItem => {
  const items = getStoredMenuItems();
  const id = `dish-${Date.now()}`;
  const newItem: FoodItem = {
    ...itemData,
    id,
    rating: itemData.rating || 5.0,
    reviewCount: itemData.reviewCount || 1,
    isAvailable: itemData.isAvailable !== false,
  };
  items.unshift(newItem);
  saveMenuItems(items);
  return newItem;
};

export const updateCustomerMenuItem = (id: string, updates: Partial<FoodItem>): FoodItem => {
  const items = getStoredMenuItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Menu item not found');
  items[index] = { ...items[index], ...updates };
  saveMenuItems(items);
  return items[index];
};

export const deleteCustomerMenuItem = (id: string): void => {
  const items = getStoredMenuItems().filter((i) => i.id !== id);
  saveMenuItems(items);
};

export const toggleItemAvailability = (id: string): boolean => {
  const items = getStoredMenuItems();
  const item = items.find((i) => i.id === id);
  if (!item) return false;
  item.isAvailable = !item.isAvailable;
  saveMenuItems(items);
  return item.isAvailable;
};

export const toggleItemFeatured = (id: string, field: 'isChefSpecial' | 'isBestseller'): boolean => {
  const items = getStoredMenuItems();
  const item = items.find((i) => i.id === id);
  if (!item) return false;
  item[field] = !item[field];
  saveMenuItems(items);
  return Boolean(item[field]);
};

// 4. Coupons & Offers Services & Admin Management
export const getStoredCoupons = (): Coupon[] => {
  if (typeof window === 'undefined') return SAMPLE_COUPONS;
  const stored = localStorage.getItem(STORAGE_KEYS.COUPONS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(SAMPLE_COUPONS));
  return SAMPLE_COUPONS;
};

export const saveCoupons = (coupons: Coupon[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  notifyCustomerDataChanged();
};

export const getCoupons = async (): Promise<Coupon[]> => {
  return getStoredCoupons();
};

export const addCoupon = (coupon: Coupon): Coupon => {
  const coupons = getStoredCoupons();
  const existingIdx = coupons.findIndex((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (existingIdx >= 0) {
    coupons[existingIdx] = coupon;
  } else {
    coupons.push(coupon);
  }
  saveCoupons(coupons);
  return coupon;
};

export const updateCoupon = (code: string, updates: Partial<Coupon>): Coupon => {
  const coupons = getStoredCoupons();
  const index = coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
  if (index === -1) throw new Error('Coupon not found');
  coupons[index] = { ...coupons[index], ...updates };
  saveCoupons(coupons);
  return coupons[index];
};

export const deleteCoupon = (code: string): void => {
  const coupons = getStoredCoupons().filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  saveCoupons(coupons);
};

export const validateCoupon = (
  code: string,
  orderSubtotal: number
): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } => {
  const coupons = getStoredCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid promo code. Please check and try again.' };
  }
  if (orderSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Add items worth ₹${coupon.minOrderAmount - orderSubtotal} more to apply ${coupon.code}.`,
    };
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

// 5. Customer Profile & Orders Persistence
export const getCustomerProfile = (): CustomerProfile => {
  if (typeof window === 'undefined') return INITIAL_CUSTOMER_PROFILE;
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
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  notifyCustomerDataChanged();
};

export const getCustomerOrders = (): CustomerOrder[] => {
  if (typeof window === 'undefined') return [];
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
  if (typeof window === 'undefined') return;
  const orders = getCustomerOrders();
  const existingIndex = orders.findIndex((o) => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  notifyCustomerDataChanged();
};

export const updateCustomerOrderStatus = (
  orderId: string,
  status: OrderStatusType
): void => {
  const orders = getCustomerOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.orderStatus = status;
    saveCustomerOrder(order);
  }
};

// 6. Reviews & Table Service Requests
export const getAllCustomerReviews = (): CustomerReview[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const submitCustomerReview = (review: CustomerReview): void => {
  if (typeof window === 'undefined') return;
  const reviews = getAllCustomerReviews();
  reviews.unshift(review);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

  const orders = getCustomerOrders();
  const order = orders.find((o) => o.id === review.orderId);
  if (order) {
    order.isRated = true;
    saveCustomerOrder(order);
  }
  notifyCustomerDataChanged();
};

export const getServiceRequests = (): ServiceRequest[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const submitServiceRequest = (req: ServiceRequest): void => {
  if (typeof window === 'undefined') return;
  const list = getServiceRequests();
  list.unshift(req);
  localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(list));
  notifyCustomerDataChanged();
};

export const updateServiceRequestStatus = (
  id: string,
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED'
): void => {
  if (typeof window === 'undefined') return;
  const list = getServiceRequests();
  const item = list.find((r) => r.id === id);
  if (item) {
    item.status = status;
    localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(list));
    notifyCustomerDataChanged();
  }
};

export const clearResolvedServiceRequests = (): void => {
  if (typeof window === 'undefined') return;
  const list = getServiceRequests().filter((r) => r.status !== 'RESOLVED');
  localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(list));
  notifyCustomerDataChanged();
};

// 7. Executive Metrics for Customer Operations
export const getCustomerOperationsStats = () => {
  const orders = getCustomerOrders();
  const menuItems = getStoredMenuItems();
  const requests = getServiceRequests();
  const reviews = getAllCustomerReviews();

  const totalCustomerOrders = orders.length;
  const totalCustomerRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingServiceRequests = requests.filter((r) => r.status === 'PENDING').length;
  const totalDishes = menuItems.length;
  const inStockDishes = menuItems.filter((i) => i.isAvailable).length;

  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.foodRating, 0) / reviews.length).toFixed(1))
      : 4.8;

  return {
    totalCustomerOrders,
    totalCustomerRevenue,
    pendingServiceRequests,
    totalDishes,
    inStockDishes,
    outOfStockDishes: totalDishes - inStockDishes,
    averageRating: avgRating,
    totalReviews: reviews.length,
  };
};
