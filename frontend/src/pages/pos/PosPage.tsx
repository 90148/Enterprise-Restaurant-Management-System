import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { menuApi } from '@/api/menu';
import { tableApi } from '@/api/tables';
import { createOrder, addItemsToOrder, getActiveOrderByTable, applyOrderDiscount } from '@/api/order';
import { MenuItem, MenuCategory, Modifier } from '@/types/menu';
import { RestaurantTable } from '@/types/table';
import { Order, OrderType, CreateOrderItemRequest } from '@/types/order';
import { ModifierModal } from './ModifierModal';
import { DiscountModal } from './DiscountModal';
import { Button } from '@/components/common/Button';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Grid,
  Users,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface CartItem {
  id: string; // Unique cart item instance ID
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: Modifier[];
  notes?: string;
  unitPrice: number;
  subtotal: number;
}

export const PosPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTableId = searchParams.get('tableId');

  // Master Data State
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');

  // Order Details
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [orderNotes, setOrderNotes] = useState('');

  // Active Existing Order on Table (Running Tab)
  const [activeTableOrder, setActiveTableOrder] = useState<Order | null>(null);

  // Cart & Financials
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState('');

  // Modals & UI Controls
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const outletId = user?.outletId || '';

  // 1. Fetch initial catalog & tables
  useEffect(() => {
    if (!outletId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [catData, itemsData, tablesData] = await Promise.all([
          menuApi.getCategories(outletId),
          menuApi.getMenuItems({ outletId, page: 0, size: 200 }),
          tableApi.getTables({ outletId }),
        ]);
        setCategories(catData.filter((c: MenuCategory) => c.active));
        setMenuItems(itemsData.content.filter((i: MenuItem) => i.active));
        setTables(tablesData.filter((t: RestaurantTable) => t.active));
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || 'Failed to load POS catalog data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [outletId]);

  // 2. Check for active running order if table changes
  useEffect(() => {
    if (orderType === 'DINE_IN' && selectedTableId && outletId) {
      const selectedTable = tables.find((t) => t.id === selectedTableId);
      if (selectedTable && selectedTable.status === 'OCCUPIED') {
        getActiveOrderByTable(outletId, selectedTableId)
          .then((order) => {
            setActiveTableOrder(order);
          })
          .catch(() => {
            setActiveTableOrder(null);
          });
      } else {
        setActiveTableOrder(null);
      }
    } else {
      setActiveTableOrder(null);
    }
  }, [selectedTableId, orderType, tables, outletId]);

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      // Dietary filter
      if (dietaryFilter === 'VEG' && !item.isVeg) return false;
      if (dietaryFilter === 'NON_VEG' && item.isVeg) return false;

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, dietaryFilter]);

  // Handle Item Click from Catalog
  const handleItemClick = (item: MenuItem) => {
    if (!item.isAvailable) return;

    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setCustomizingItem(item);
    } else {
      addItemToCart(item, [], '');
    }
  };

  // Add Item to Cart
  const addItemToCart = (item: MenuItem, modifiers: Modifier[], notes: string) => {
    const basePrice = Number(item.price);
    const modDelta = modifiers.reduce((acc, m) => acc + Number(m.price || 0), 0);
    const unitPrice = basePrice + modDelta;

    const cartItemId = `${item.id}-${modifiers.map((m) => m.id).sort().join('-')}-${notes}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + 1;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          subtotal: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            menuItem: item,
            quantity: 1,
            selectedModifiers: modifiers,
            notes,
            unitPrice,
            subtotal: unitPrice,
          },
        ];
      }
    });
  };

  // Update Cart Item Quantity
  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.id === cartItemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...ci,
              quantity: newQty,
              subtotal: ci.unitPrice * newQty,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountReason('');
    setErrorMessage(null);
  };

  // Financial Computations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

  const taxRate = 5; // 5% default standard GST
  const calculatedTax = (subtotal * taxRate) / 100;

  const calculatedDiscount = useMemo(() => {
    if (discountValue <= 0) return 0;
    if (discountType === 'PERCENTAGE') {
      return Math.min((subtotal * discountValue) / 100, subtotal);
    }
    return Math.min(discountValue, subtotal);
  }, [subtotal, discountValue, discountType]);

  const grandTotal = Math.max(0, subtotal + calculatedTax - calculatedDiscount);

  // Submit / Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setErrorMessage('Please add at least one item to the cart');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTableId) {
      setErrorMessage('Please select a dining table for Dine-In orders');
      return;
    }

    if ((orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && !customerName.trim()) {
      setErrorMessage(`Customer name is required for ${orderType.toLowerCase()} orders`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const itemsPayload: CreateOrderItemRequest[] = cart.map((ci) => ({
        menuItemId: ci.menuItem.id,
        quantity: ci.quantity,
        notes: ci.notes,
        selectedModifierIds: ci.selectedModifiers.map((m) => m.id),
      }));

      let resultOrder: Order;

      // If adding to an existing open table tab
      if (activeTableOrder) {
        resultOrder = await addItemsToOrder(activeTableOrder.id, { items: itemsPayload });
      } else {
        resultOrder = await createOrder({
          outletId,
          tableId: orderType === 'DINE_IN' ? selectedTableId : undefined,
          orderType,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          guestCount: orderType === 'DINE_IN' ? guestCount : 1,
          notes: orderNotes.trim() || undefined,
          items: itemsPayload,
        });
      }

      if (discountValue > 0) {
        resultOrder = await applyOrderDiscount(resultOrder.id, {
          discountType,
          discountValue,
          reason: discountReason || 'POS Discount',
        });
      }

      setSuccessOrder(resultOrder);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5rem)]">
      {/* LEFT COLUMN: Catalog & Item Selection */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Top Control Bar */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 space-y-3">
          {/* Order Type Tabs & Table Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Order Type Switcher */}
            <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setOrderType(type);
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderType === type
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Table & Guests (Dine-In only) */}
            {orderType === 'DINE_IN' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/60">
                  <Grid className="w-3.5 h-3.5 text-emerald-400" />
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      Select Table
                    </option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.tableNumber} ({t.floorName || 'Floor'}) - {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/60">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white px-1">{guestCount}</span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* Takeaway / Delivery Details Input */
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-32 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Link to Live Orders */}
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Orders</span>
            </button>
          </div>

          {/* Running Tab Notice */}
          {activeTableOrder && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Active running tab found on this table (<b>{activeTableOrder.orderNumber}</b> - $
                  {activeTableOrder.totalAmount.toFixed(2)}). New items will append to this tab.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/orders?search=${activeTableOrder.orderNumber}`)}
                className="underline text-[11px] font-semibold text-amber-400 hover:text-white flex items-center gap-1"
              >
                <span>View Tab</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Search & Dietary Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search menu catalog (e.g. Margherita, Pasta, Wings)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Veg / Non-Veg Pills */}
            <div className="flex p-0.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setDietaryFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  dietaryFilter === 'ALL' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('VEG')}
                className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  dietaryFilter === 'VEG'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-emerald-400 hover:text-white'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Veg
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('NON_VEG')}
                className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  dietaryFilter === 'NON_VEG'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-rose-400 hover:text-white'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Grid Area */}
        <div className="flex-1 overflow-y-auto p-3.5">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Loading menu catalog...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <UtensilsCrossed className="w-10 h-10 stroke-1" />
              <p className="text-xs">No items match your selected filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredItems.map((item) => {
                const isCustomizable = item.modifierGroups && item.modifierGroups.length > 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.isAvailable}
                    onClick={() => handleItemClick(item)}
                    className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      !item.isAvailable
                        ? 'bg-slate-900/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-emerald-500/80 hover:bg-slate-800 hover:shadow-lg hover:shadow-emerald-950/20 active:scale-[0.98]'
                    }`}
                  >
                    {/* Item Top Row */}
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between gap-1">
                        {/* Veg / Non-Veg Indicator */}
                        <div
                          className={`w-3.5 h-3.5 rounded border p-0.5 flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>

                        {/* Prep time */}
                        {item.prepTimeMinutes && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.prepTimeMinutes}m
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {item.description || item.categoryName}
                      </p>
                    </div>

                    {/* Item Bottom Row */}
                    <div className="pt-2.5 mt-2 border-t border-slate-700/40 flex items-center justify-between w-full">
                      <span className="text-xs font-black text-emerald-400">
                        ${Number(item.price).toFixed(2)}
                      </span>

                      {isCustomizable && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-700/60 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Sold Out / 86 Badge */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400">
                          Sold Out (86)
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Order Cart & Checkout Slip */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">
                  {orderType === 'DINE_IN'
                    ? selectedTableId
                      ? `Table: ${tables.find((t) => t.id === selectedTableId)?.tableNumber || 'Selected'}`
                      : 'Table Not Selected'
                    : customerName || `${orderType.replace('_', ' ')} Order`}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                {cart.length} item type(s) • {cart.reduce((s, i) => s + i.quantity, 0)} total pcs
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="m-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-400">Your order cart is empty</p>
              <p className="text-[11px] text-slate-600">
                Click any dish from the catalog to build this order
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{item.menuItem.name}</h5>
                    <div className="text-[11px] text-slate-400">
                      ${item.unitPrice.toFixed(2)} each
                    </div>
                  </div>

                  <span className="text-xs font-black text-slate-100">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Modifiers List */}
                {item.selectedModifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.selectedModifiers.map((mod) => (
                      <span
                        key={mod.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-emerald-300 font-medium"
                      >
                        +{mod.name}
                        {Number(mod.price) > 0 && ` ($${Number(mod.price).toFixed(2)})`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Item Notes */}
                {item.notes && (
                  <p className="text-[10px] text-amber-300/90 italic bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Note: {item.notes}
                  </p>
                )}

                {/* Stepper Controls & Delete */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Notes Field */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <input
            type="text"
            placeholder="Order remarks (e.g. VIP, Rush, Allergen)..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Financials & Checkout Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-800/40 space-y-2.5">
          {/* Subtotal & Taxes */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax (5% GST):</span>
              <span className="font-semibold text-slate-200">${calculatedTax.toFixed(2)}</span>
            </div>

            {/* Discount Line */}
            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Tag className="w-3 h-3" />
                <span>
                  {calculatedDiscount > 0
                    ? `Discount (${discountType === 'PERCENTAGE' ? `${discountValue}%` : `$${discountValue}`})`
                    : 'Add Discount'}
                </span>
              </button>
              {calculatedDiscount > 0 ? (
                <span className="font-bold text-emerald-400">-${calculatedDiscount.toFixed(2)}</span>
              ) : (
                <span className="text-slate-500">$0.00</span>
              )}
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-700/60 flex items-baseline justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Grand Total</span>
            <span className="text-lg font-black text-emerald-400">${grandTotal.toFixed(2)}</span>
          </div>

          {/* Place / Send Order Button */}
          <Button
            variant="primary"
            className="w-full py-3 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              'Submitting Order...'
            ) : activeTableOrder ? (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Add to Running Tab (${grandTotal.toFixed(2)})
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Order to Kitchen (${grandTotal.toFixed(2)})
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Modifier Customization Modal */}
      <ModifierModal
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        item={customizingItem}
        onConfirm={(mods, notes) => {
          if (customizingItem) {
            addItemToCart(customizingItem, mods, notes);
          }
        }}
      />

      {/* Discount Modal */}
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={subtotal}
        currentDiscount={calculatedDiscount}
        onApplyDiscount={(type, val, reason) => {
          setDiscountType(type);
          setDiscountValue(val);
          setDiscountReason(reason);
        }}
        onRemoveDiscount={() => {
          setDiscountValue(0);
          setDiscountReason('');
        }}
      />

      {/* Success Order Confirmation Modal */}
      {successOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Order Sent Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Order Number: <b className="text-emerald-400">{successOrder.orderNumber}</b>
              </p>
              {successOrder.tableNumber && (
                <p className="text-xs text-slate-400">
                  Table: <b className="text-white">{successOrder.tableNumber}</b> (Occupied)
                </p>
              )}
              <p className="text-sm font-black text-emerald-400 mt-2">
                Total: ${successOrder.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setSuccessOrder(null);
                }}
              >
                Start New Order
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  navigate(`/orders?search=${successOrder.orderNumber}`);
                }}
              >
                Track in Live Orders
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
