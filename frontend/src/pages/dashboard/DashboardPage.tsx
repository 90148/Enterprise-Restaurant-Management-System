import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Grid,
  AlertTriangle,
  ShoppingBag,
  ChefHat,
  Receipt,
  Radio,
  RefreshCw,
  ArrowRight,
  UtensilsCrossed,
  BellRing,
  Star,
  Plus,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { getDashboardStats } from '@/api/report';
import { formatCurrency } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import { useWebSocketSync } from '@/hooks/useWebSocketSync';
import {
  getCustomerOperationsStats,
  getServiceRequests,
  getStoredMenuItems,
  toggleItemAvailability,
  updateServiceRequestStatus,
} from '@/services/customerService';
import { AdminCustomerFoodModal } from '@/components/admin/AdminCustomerFoodModal';
import { ServiceRequest, FoodItem } from '@/types/customer';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeOutletId } = useAuth();
  const outletId = activeOutletId || user?.outletId || undefined;
  const outletName = user?.outletName || 'Primary Outlet';
  const { isConnected } = useWebSocketSync();

  const {
    data: stats,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-stats', outletId],
    queryFn: () => getDashboardStats(outletId),
    refetchInterval: 15000,
  });

  const chartData = stats?.hourlyTrend.map((h) => ({
    hour: h.label,
    revenue: Number(h.revenue) || 0,
    orders: h.orderCount || 0,
  })) || [];

  // Customer operations state
  const [customerStats, setCustomerStats] = useState(() => getCustomerOperationsStats());
  const [recentServiceCalls, setRecentServiceCalls] = useState<ServiceRequest[]>([]);
  const [customerWatchlist, setCustomerWatchlist] = useState<FoodItem[]>([]);
  const [isAddCustomerDishOpen, setIsAddCustomerDishOpen] = useState(false);

  const loadCustomerDashboardData = () => {
    setCustomerStats(getCustomerOperationsStats());
    setRecentServiceCalls(getServiceRequests().slice(0, 5));
    setCustomerWatchlist(getStoredMenuItems().slice(0, 6));
  };

  useEffect(() => {
    loadCustomerDashboardData();

    const handleUpdated = () => {
      loadCustomerDashboardData();
    };

    window.addEventListener('restomaster_customer_data_updated', handleUpdated);
    return () => {
      window.removeEventListener('restomaster_customer_data_updated', handleUpdated);
    };
  }, []);

  const handleResolveService = (id: string) => {
    updateServiceRequestStatus(id, 'RESOLVED');
    loadCustomerDashboardData();
  };

  const handleToggleDishStock = (id: string) => {
    toggleItemAvailability(id);
    loadCustomerDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-500' : 'text-amber-500'}`} />
              <span>{isConnected ? 'Live Sync Active' : 'Connecting Sync...'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operations for <span className="font-semibold text-slate-700">{outletName}</span>
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddCustomerDishOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-amber-600" />}
            className="border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold"
          >
            + Add Customer Dish
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/customer-management')}
            leftIcon={<UtensilsCrossed className="w-3.5 h-3.5 text-slate-700" />}
          >
            Customer Hub
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/pos')}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Open POS</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={isLoading ? '...' : formatCurrency(stats?.todayRevenue || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={
            stats && stats.yesterdayRevenue > 0
              ? {
                  value: Math.abs(stats.revenueTrendPercent),
                  isPositive: stats.revenueTrendPercent >= 0,
                }
              : undefined
          }
          description="vs. yesterday"
          color="emerald"
        />
        <StatCard
          title="Active Tables"
          value={isLoading ? '...' : `${stats?.activeTables || 0} / ${stats?.totalTables || 0}`}
          icon={<Grid className="w-5 h-5" />}
          description={`${stats?.availableTables || 0} tables available`}
          color="blue"
        />
        <StatCard
          title="Live Orders"
          value={isLoading ? '...' : stats?.liveOrders ?? 0}
          icon={<Clock className="w-5 h-5" />}
          description="In kitchen queue / prep"
          color="amber"
        />
        <StatCard
          title="Completed Orders"
          value={isLoading ? '...' : stats?.todayCompletedOrders ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          description="Orders served today"
          color="purple"
        />
      </div>

      {/* Operational Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hourly Sales & Traffic Trend */}
        <div className="lg:col-span-2">
          <Card
            title="Today's Hourly Revenue Trend"
            subtitle="Real-time transaction volume and revenue curve across operating hours"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reports/sales')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <span>Full Reports</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            }
          >
            <div className="h-72 w-full pt-2">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading revenue curve...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Revenue']}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No sales recorded yet today
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Low Stock Alerts */}
        <div>
          <Card
            title="Inventory Watchlist"
            subtitle="Low stock and re-order thresholds"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inventory')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
              >
                Manage
              </Button>
            }
          >
            {isLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Checking stock thresholds...</div>
            ) : !stats?.lowStockAlerts || stats.lowStockAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-75" />
                <p className="font-semibold text-slate-700">All Ingredients Stocked</p>
                <p className="text-slate-400">No items below minimum re-order thresholds.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockAlerts.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 text-xs hover:bg-amber-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-amber-950 block">{item.name}</span>
                        <span className="text-[11px] text-amber-800">SKU: {item.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-700 font-bold block">
                        {Number(item.currentStock).toFixed(1)} {item.unitSymbol || item.unitName}
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">Low stock</span>
                    </div>
                  </div>
                ))}

                {stats.lowStockAlerts.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-amber-700 font-medium pt-1"
                    onClick={() => navigate('/inventory')}
                  >
                    View all {stats.lowStockAlerts.length} low stock items →
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Access Operations Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/kitchen')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Kitchen Display (KDS)</h4>
              <p className="text-xs text-slate-500">View real-time station bump bars</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => navigate('/tables')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Floor & Tables</h4>
              <p className="text-xs text-slate-500">Live floor blueprint & reservations</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => navigate('/billing')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Billing & Settlements</h4>
              <p className="text-xs text-slate-500">Open guest tabs & split payments</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Customer Experience & Online Dining Operations Section */}
      <div className="pt-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Customer Portal Operations</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Digital Dining Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live metrics, table assistance requests, and fast dish stock management for the customer app
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/customer/home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>View Customer App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/customer-management')}
              className="text-xs font-semibold"
            >
              Full Customer Hub →
            </Button>
          </div>
        </div>

        {/* Customer KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Customer Online Orders"
            value={customerStats.totalCustomerOrders}
            icon={<ShoppingBag className="w-5 h-5" />}
            description={`₹${customerStats.totalCustomerRevenue.toLocaleString()} online revenue`}
            color="emerald"
          />
          <StatCard
            title="Pending Table Calls"
            value={customerStats.pendingServiceRequests}
            icon={<BellRing className="w-5 h-5" />}
            description={
              customerStats.pendingServiceRequests > 0
                ? 'Action required at dining tables'
                : 'All table requests attended'
            }
            color={customerStats.pendingServiceRequests > 0 ? 'rose' : 'blue'}
          />
          <StatCard
            title="Customer Menu Dishes"
            value={`${customerStats.inStockDishes} / ${customerStats.totalDishes}`}
            icon={<UtensilsCrossed className="w-5 h-5" />}
            description={`${customerStats.outOfStockDishes} dishes currently 86'd`}
            color="purple"
          />
          <StatCard
            title="Customer Rating Score"
            value={`${customerStats.averageRating} ★`}
            icon={<Star className="w-5 h-5" />}
            description={`${customerStats.totalReviews} diner reviews submitted`}
            color="amber"
          />
        </div>

        {/* 2-Column Operational Grid: In-seat Calls + Quick 86'ing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table Service Calls */}
          <Card
            title="Live Table Assistance Queue"
            subtitle="Real-time calls from seated guests (Call Waiter, Water, Bill, Clean)"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer-management')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
              >
                View All
              </Button>
            }
          >
            {recentServiceCalls.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto opacity-80" />
                <p className="font-semibold text-slate-700">No Pending Table Calls</p>
                <p className="text-slate-400">All dining tables are comfortable and serviced.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentServiceCalls.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        Table {req.tableNumber}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {(req.requestType === 'WAITER' || (req.requestType as string) === 'CALL_WAITER') && '🔔 Call Waiter'}
                          {req.requestType === 'WATER' && '💧 Drinking Water'}
                          {req.requestType === 'BILL' && '🧾 Final Bill'}
                          {(req.requestType === 'CLEAN' || (req.requestType as string) === 'CLEAN_TABLE') && '🧹 Table Clean'}
                        </span>
                        <span className="text-[10px] text-slate-400">{req.timestamp || req.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'PENDING'
                            ? 'bg-rose-100 text-rose-700 animate-pulse'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => handleResolveService(req.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Dish Availability & 86'ing */}
          <Card
            title="Fast Dish Stock Control (86'ing)"
            subtitle="Instantly enable or disable items from appearing on customer digital menus"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddCustomerDishOpen(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dish</span>
              </Button>
            }
          >
            <div className="space-y-2">
              {customerWatchlist.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block truncate max-w-[180px] sm:max-w-xs">
                        {dish.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ₹{dish.price} • {dish.cuisine}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDishStock(dish.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      dish.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {dish.isAvailable ? '● In Stock' : '✕ 86 Out'}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Admin Customer Dish Creation Modal */}
      <AdminCustomerFoodModal
        isOpen={isAddCustomerDishOpen}
        onClose={() => setIsAddCustomerDishOpen(false)}
        onSuccess={() => {
          loadCustomerDashboardData();
        }}
      />
    </div>
  );
};

export default DashboardPage;

