import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
  ExternalLink,
  Tag,
  BellRing,
  Star,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import {
  FoodItem,
  FoodCategory,
  CustomerOrder,
  Coupon,
  ServiceRequest,
  CustomerReview,
} from '@/types/customer';
import {
  getStoredMenuItems,
  getStoredCategories,
  getStoredCoupons,
  getCustomerOrders,
  getServiceRequests,
  getAllCustomerReviews,
  deleteCustomerMenuItem,
  toggleItemAvailability,
  toggleItemFeatured,
  updateCustomerOrderStatus,
  updateServiceRequestStatus,
  clearResolvedServiceRequests,
  addCoupon,
  deleteCoupon,
  getCustomerOperationsStats,
} from '@/services/customerService';
import Button from '@/components/common/Button';
import StatCard from '@/components/common/StatCard';
import { AdminCustomerFoodModal } from '@/components/admin/AdminCustomerFoodModal';

export const CustomerPortalManagerPage: React.FC = () => {
  // Navigation / active tab
  const [activeTab, setActiveTab] = useState<'dishes' | 'orders' | 'services' | 'vouchers' | 'reviews'>('dishes');

  // Data states
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [stats, setStats] = useState(() => getCustomerOperationsStats());

  // Search & Filter in dishes tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<FoodItem | null>(null);

  // New Voucher modal/state
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [vCode, setVCode] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vType, setVType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [vValue, setVValue] = useState<number>(20);
  const [vMinOrder, setVMinOrder] = useState<number>(499);
  const [vMaxDiscount, setVMaxDiscount] = useState<number>(150);
  const [vValidUntil, setVValidUntil] = useState('31 Dec 2026');

  // Refresh handler
  const loadAllData = () => {
    setMenuItems(getStoredMenuItems());
    setCategories(getStoredCategories());
    setOrders(getCustomerOrders());
    setServiceRequests(getServiceRequests());
    setCoupons(getStoredCoupons());
    setReviews(getAllCustomerReviews());
    setStats(getCustomerOperationsStats());
  };

  useEffect(() => {
    loadAllData();

    const handleDataChanged = () => {
      loadAllData();
    };

    window.addEventListener('restomaster_customer_data_updated', handleDataChanged);
    return () => {
      window.removeEventListener('restomaster_customer_data_updated', handleDataChanged);
    };
  }, []);

  // Dish Operations
  const handleToggleStock = (dishId: string) => {
    toggleItemAvailability(dishId);
    loadAllData();
  };

  const handleToggleChefSpecial = (dishId: string) => {
    toggleItemFeatured(dishId, 'isChefSpecial');
    loadAllData();
  };

  const handleDeleteDish = (dishId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the customer menu?`)) {
      deleteCustomerMenuItem(dishId);
      loadAllData();
    }
  };

  // Order Operations
  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    updateCustomerOrderStatus(orderId, newStatus);
    loadAllData();
  };

  // Service Request Operations
  const handleServiceStatus = (id: string, status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED') => {
    updateServiceRequestStatus(id, status);
    loadAllData();
  };

  const handleClearResolved = () => {
    clearResolvedServiceRequests();
    loadAllData();
  };

  // Voucher Operations
  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim()) return;
    const newCoupon: Coupon = {
      code: vCode.toUpperCase().trim(),
      title: vTitle.trim() || `${vValue}% Off On Orders`,
      description: vDesc.trim() || `Special promotional discount of ${vValue}${vType === 'PERCENTAGE' ? '%' : '₹'}`,
      discountType: vType,
      discountValue: Number(vValue),
      minOrderAmount: Number(vMinOrder),
      maxDiscountAmount: vType === 'PERCENTAGE' ? Number(vMaxDiscount) : undefined,
      validUntil: vValidUntil,
      terms: ['Valid on customer portal orders', 'Cannot be clubbed with other promos'],
    };
    addCoupon(newCoupon);
    setShowVoucherForm(false);
    setVCode('');
    setVTitle('');
    setVDesc('');
    loadAllData();
  };

  const handleDeleteVoucher = (code: string) => {
    if (window.confirm(`Deactivate promo voucher ${code}?`)) {
      deleteCoupon(code);
      loadAllData();
    }
  };

  // Filtered Dishes
  const filteredDishes = menuItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.cuisine.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCategory !== 'ALL' && item.categoryId.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (dietaryFilter === 'VEG' && !item.isVeg) return false;
    if (dietaryFilter === 'NON_VEG' && item.isVeg) return false;
    if (stockFilter === 'IN_STOCK' && !item.isAvailable) return false;
    if (stockFilter === 'OUT_OF_STOCK' && item.isAvailable) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Customer Portal Operations Hub</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Live Customer Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete administrative control over customer dishes, table assistance calls, online orders, and coupons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAllData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <a
            href="/customer/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <span>Open Customer App</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingDish(null);
              setIsFoodModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="shadow-sm"
          >
            Add Customer Dish
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Customer Portal Orders"
          value={stats.totalCustomerOrders}
          icon={<ShoppingBag className="w-5 h-5" />}
          description={`₹${stats.totalCustomerRevenue.toLocaleString()} online revenue`}
          color="emerald"
        />
        <StatCard
          title="Table Service Calls"
          value={stats.pendingServiceRequests}
          icon={<BellRing className="w-5 h-5" />}
          description={stats.pendingServiceRequests > 0 ? 'Requires immediate attention' : 'All tables attended'}
          color={stats.pendingServiceRequests > 0 ? 'rose' : 'blue'}
        />
        <StatCard
          title="Customer Menu Catalog"
          value={stats.totalDishes}
          icon={<UtensilsCrossed className="w-5 h-5" />}
          description={`${stats.inStockDishes} In Stock • ${stats.outOfStockDishes} Out of Stock`}
          color="purple"
        />
        <StatCard
          title="Guest Rating Average"
          value={`${stats.averageRating} ★`}
          icon={<Star className="w-5 h-5" />}
          description={`${stats.totalReviews} customer feedback submitted`}
          color="amber"
        />
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 flex items-center gap-4 text-xs font-semibold shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('dishes')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'dishes'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Menu & Dishes ({menuItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Live Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'services'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Table Service Calls</span>
          {stats.pendingServiceRequests > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center animate-pulse">
              {stats.pendingServiceRequests}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vouchers')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'vouchers'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promo Vouchers & Coupons ({coupons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Guest Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: MENU & DISHES */}
      {activeTab === 'dishes' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Category, Dietary, Stock */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full md:max-w-xs relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dishes by name or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Dietary Filter */}
              <select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Dietary</option>
                <option value="VEG">Pure Veg</option>
                <option value="NON_VEG">Non-Veg</option>
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Stock Status</option>
                <option value="IN_STOCK">In Stock Only</option>
                <option value="OUT_OF_STOCK">Out of Stock (86'd)</option>
              </select>
            </div>
          </div>

          {/* Dishes Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Category & Cuisine</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Prep Time</th>
                    <th className="py-3 px-4">In Stock Status</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDishes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No dishes match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDishes.map((dish) => (
                      <tr key={dish.id} className="hover:bg-slate-50 transition-colors">
                        {/* Dish Name & Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img
                                src={dish.imageUrl}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                                <span className="font-bold text-slate-900">{dish.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                                {dish.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Cuisine */}
                        <td className="py-3 px-4">
                          <span className="font-medium capitalize text-slate-800 block">
                            {dish.categoryId}
                          </span>
                          <span className="text-[10px] text-slate-500">{dish.cuisine}</span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 font-mono">₹{dish.price}</span>
                        </td>

                        {/* Prep Time */}
                        <td className="py-3 px-4">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{dish.prepTimeMinutes} mins</span>
                          </span>
                        </td>

                        {/* In Stock Toggle */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(dish.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                              dish.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            }`}
                          >
                            {dish.isAvailable ? '● In Stock' : '✕ Out of Stock (86)'}
                          </button>
                        </td>

                        {/* Chef Special / Bestseller */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleChefSpecial(dish.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                              dish.isChefSpecial
                                ? 'bg-purple-50 text-purple-700 border-purple-300'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{dish.isChefSpecial ? "Chef's Pick" : 'Standard'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDish(dish);
                                setIsFoodModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                              title="Edit Dish"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDish(dish.id, dish.name)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CUSTOMER LIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Orders from Customer Dashboard</h3>
                <p className="text-xs text-slate-500">Live feed of orders placed by dining & delivery guests</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">Total: {orders.length} orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Mode / Table</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No customer portal orders placed yet. Place an order on the Customer App to test!
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900 block">{o.orderNumber || o.id}</span>
                          <span className="text-[10px] text-slate-400">{o.createdAt}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase block w-fit">
                            {o.orderType}
                          </span>
                          {o.tableNumber && (
                            <span className="text-emerald-700 font-bold text-[11px]">Table {o.tableNumber}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{o.customerName || 'Guest Diner'}</span>
                          <span className="text-[10px] text-slate-500">{o.customerPhone || '—'}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-medium text-slate-800 block">
                            {o.items?.map((i) => `${i.quantity}x ${i.foodItem.name}`).join(', ')}
                          </span>
                          {o.specialInstructions && (
                            <span className="text-[10px] text-amber-700 italic block">
                              Note: {o.specialInstructions}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-slate-900">
                          ₹{o.grandTotal}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {o.paymentMethod} • PAID
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-500"
                          >
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PREPARING">Preparing (Kitchen)</option>
                            <option value="READY">Ready to Serve</option>
                            <option value="SERVED">Served / Completed</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TABLE SERVICE CALLS */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">In-Seat Table Service Calls</h3>
                <p className="text-xs text-slate-500">
                  Requests sent by customers from their dining table ("Call Waiter", "Water", "Bill", "Clean")
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleClearResolved}>
                Clear Resolved
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Table</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {serviceRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No active service requests right now.
                      </td>
                    </tr>
                  ) : (
                    serviceRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                            Table {req.tableNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {(req.requestType === 'WAITER' || (req.requestType as string) === 'CALL_WAITER') && '🔔 Call Waiter'}
                          {req.requestType === 'WATER' && '💧 Water Request'}
                          {req.requestType === 'BILL' && '🧾 Bill Request'}
                          {(req.requestType === 'CLEAN' || (req.requestType as string) === 'CLEAN_TABLE') && '🧹 Clean Table'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{req.timestamp || req.createdAt}</td>
                        <td className="py-3 px-4 text-slate-600 italic">{req.notes || '—'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              req.status === 'PENDING'
                                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                                : req.status === 'ACKNOWLEDGED'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {req.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleServiceStatus(req.id, 'ACKNOWLEDGED')}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold"
                              >
                                Acknowledge
                              </button>
                            )}
                            {req.status !== 'RESOLVED' && (
                              <button
                                type="button"
                                onClick={() => handleServiceStatus(req.id, 'RESOLVED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: VOUCHERS & COUPONS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Promotional Vouchers</h3>
                <p className="text-xs text-slate-500">
                  Manage coupons that customers can apply at checkout in the Customer Portal
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowVoucherForm((prev) => !prev)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                {showVoucherForm ? 'Close Form' : 'New Promo Voucher'}
              </Button>
            </div>

            {/* Inline New Voucher Form */}
            {showVoucherForm && (
              <form onSubmit={handleAddVoucher} className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Create Promo Code</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MONSOON30"
                      value={vCode}
                      onChange={(e) => setVCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs uppercase font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Discount Type</label>
                    <select
                      value={vType}
                      onChange={(e) => setVType(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={vValue}
                      onChange={(e) => setVValue(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={vMinOrder}
                      onChange={(e) => setVMinOrder(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={vMaxDiscount}
                      onChange={(e) => setVMaxDiscount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Valid Until</label>
                    <input
                      type="text"
                      placeholder="e.g. 31 Dec 2026"
                      value={vValidUntil}
                      onChange={(e) => setVValidUntil(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setShowVoucherForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save & Activate Voucher
                  </Button>
                </div>
              </form>
            )}

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/80 relative space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-lg font-mono tracking-wider">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVoucher(c.code)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Deactivate coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                  <p className="text-[11px] text-slate-600">{c.description}</p>
                  <div className="pt-2 border-t border-amber-200/60 text-[10px] text-slate-500 flex justify-between">
                    <span>Min Order: ₹{c.minOrderAmount}</span>
                    <span>Valid: {c.validUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: GUEST REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Feedback & 5-Star Ratings</h3>
              <p className="text-xs text-slate-500">
                Direct ratings submitted by diners after their meals
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No customer ratings submitted yet. Diners can rate dishes after checkout in the Customer Portal.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{r.customerName || 'Guest Diner'}</span>
                      <span className="text-[10px] text-slate-400">{r.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-4 text-amber-500 font-bold">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Food: {r.foodRating}/5</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        Service: {r.serviceRating}/5
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        Ambience: {r.ambienceRating || r.experienceRating || 5}/5
                      </span>
                    </div>

                    {r.comment && (
                      <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal to Add/Edit Customer Food Dish */}
      <AdminCustomerFoodModal
        isOpen={isFoodModalOpen}
        onClose={() => {
          setIsFoodModalOpen(false);
          setEditingDish(null);
        }}
        onSuccess={() => {
          loadAllData();
        }}
        editItem={editingDish}
      />
    </div>
  );
};

export default CustomerPortalManagerPage;
