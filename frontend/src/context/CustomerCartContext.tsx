import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FoodItem, FoodCustomization, CartItem, CartSummary, Coupon } from '@/types/customer';
import { validateCoupon } from '@/services/customerService';
import { useCustomerContext } from './CustomerContext';

interface CustomerCartContextType {
  cartItems: CartItem[];
  addItem: (foodItem: FoodItem, customization?: FoodCustomization, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  cartSummary: CartSummary;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  customizingItem: FoodItem | null;
  openCustomization: (item: FoodItem) => void;
  closeCustomization: () => void;
  getItemQuantity: (foodItemId: string) => number;
}

const CustomerCartContext = createContext<CustomerCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'restomaster_customer_cart';
const COUPON_STORAGE_KEY = 'restomaster_applied_coupon';

export const CustomerCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orderType } = useCustomerContext();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem(COUPON_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<FoodItem | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const generateCartItemId = (foodItem: FoodItem, customization?: FoodCustomization): string => {
    if (!customization) return foodItem.id;
    const variantPart = customization.selectedVariant?.id || 'default';
    const modPart = (customization.selectedModifiers || [])
      .map((m) => m.optionId)
      .sort()
      .join('-');
    const spicePart = customization.spiceLevel ?? 'def';
    return `${foodItem.id}__${variantPart}__${modPart}__${spicePart}`;
  };

  const addItem = (foodItem: FoodItem, customization?: FoodCustomization, quantity = 1) => {
    const effectiveCustomization: FoodCustomization = customization || {
      selectedVariant: foodItem.variants?.find((v) => v.isDefault) || foodItem.variants?.[0],
      selectedModifiers: [],
      spiceLevel: foodItem.spiceLevel ?? 1,
    };

    let unitPrice = effectiveCustomization.selectedVariant ? effectiveCustomization.selectedVariant.price : foodItem.price;
    if (effectiveCustomization.selectedModifiers) {
      unitPrice += effectiveCustomization.selectedModifiers.reduce((acc, m) => acc + m.priceDelta, 0);
    }

    const cartItemId = generateCartItemId(foodItem, effectiveCustomization);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        );
      } else {
        const newItem: CartItem = {
          cartItemId,
          foodItem,
          customization: effectiveCustomization,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponMessage(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  const openCustomization = (item: FoodItem) => {
    setCustomizingItem(item);
  };

  const closeCustomization = () => {
    setCustomizingItem(null);
  };

  const getItemQuantity = (foodItemId: string): number => {
    return cartItems
      .filter((item) => item.foodItem.id === foodItemId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  // Dynamic calculations
  const cartSummary: CartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    let discountAmount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscountAmount && discountAmount > appliedCoupon.maxDiscountAmount) {
          discountAmount = appliedCoupon.maxDiscountAmount;
        }
      } else {
        discountAmount = appliedCoupon.discountValue;
      }
    }

    const netAfterDiscount = Math.max(0, subtotal - discountAmount);
    // GST Tax (5%)
    const taxAmount = Math.round(netAfterDiscount * 0.05);
    // Service Charge (5% for Dine-In only)
    const serviceChargeAmount = orderType === 'DINE_IN' && subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    // Delivery / Packaging fee
    const deliveryFee = orderType === 'DELIVERY' && subtotal > 0 ? 30 : orderType === 'TAKEAWAY' && subtotal > 0 ? 15 : 0;

    const grandTotal = netAfterDiscount + taxAmount + serviceChargeAmount + deliveryFee;

    return {
      subtotal,
      discountAmount,
      appliedCoupon: appliedCoupon || undefined,
      taxAmount,
      serviceChargeAmount,
      deliveryFee,
      grandTotal,
      itemCount,
    };
  }, [cartItems, appliedCoupon, orderType]);

  const applyCouponCode = (code: string): boolean => {
    const result = validateCoupon(code, cartSummary.subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponMessage(result.message);
      return true;
    } else {
      setCouponMessage(result.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  return (
    <CustomerCartContext.Provider
      value={{
        cartItems,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        appliedCoupon,
        couponMessage,
        applyCouponCode,
        removeCoupon,
        cartSummary,
        isCartOpen,
        setIsCartOpen,
        customizingItem,
        openCustomization,
        closeCustomization,
        getItemQuantity,
      }}
    >
      {children}
    </CustomerCartContext.Provider>
  );
};

export const useCustomerCartContext = () => {
  const context = useContext(CustomerCartContext);
  if (!context) {
    throw new Error('useCustomerCartContext must be used within a CustomerCartProvider');
  }
  return context;
};
