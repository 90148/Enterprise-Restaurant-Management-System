import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getOrders, getOrderStats, updateOrderStatus } from '@/api/order';
import { Order, OrderStatus, OrderType, OrderStats } from '@/types/order';
import { OrderDetailModal } from './OrderDetailModal';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import { Pagination } from '@/components/common/Pagination';
import {
  Clock,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Plus,
  ChefHat,
  Bell,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

export const OrderListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const outletId = user?.outletId || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // Selected Order for Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!outletId) return;
    try {
      const statsData = await getOrderStats(outletId);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load order stats', err);
    }
  };

  const fetchOrders = async () => {
    if (!outletId) return;
    try {
      setIsLoading(true);
      let statusParam: OrderStatus | undefined = undefined;
      if (statusFilter !== 'ALL' && statusFilter !== 'ACTIVE') {
        statusParam = statusFilter as OrderStatus;
      }

      const orderTypeParam: OrderType | undefined =
        typeFilter !== 'ALL' ? (typeFilter as OrderType) : undefined;

      const data = await getOrders({
        outletId,
        status: statusParam,
        orderType: orderTypeParam,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        size: pageSize,
      });

      // If 'ACTIVE' filter is selected, filter out COMPLETED and CANCELLED in client if backend returns all
      let resultOrders = data.content;
      if (statusFilter === 'ACTIVE') {
        resultOrders = resultOrders.filter(
          (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
        );
      }

      setOrders(resultOrders);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [outletId]);

  useEffect(() => {
    fetchOrders();
  }, [outletId, statusFilter, typeFilter, searchQuery, currentPage]);

  const handleQuickStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { status: nextStatus, reason: 'Quick action bar' });
      fetchOrders();
      fetchStats();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ACCEPTED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'PREPARING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'READY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'SERVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-wide">Live Orders & History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time kitchen tickets, table tabs, and order lifecycle states
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/pos')}
          className="flex items-center gap-2 shadow-lg shadow-emerald-600/20 text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>New POS Order</span>
        </Button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Live Orders"
          value={stats?.activeOrders ?? 0}
          icon={<Clock className="w-5 h-5" />}
          description="Pending & in kitchen"
          color="amber"
        />
        <StatCard
          title="Total Orders Today"
          value={stats?.totalOrders ?? 0}
          icon={<ShoppingBag className="w-5 h-5" />}
          description="Registered today"
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedOrders ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          description="Settled & paid"
          color="emerald"
        />
        <StatCard
          title="Cancelled Today"
          value={stats?.cancelledOrders ?? 0}
          icon={<XCircle className="w-5 h-5" />}
          description="Voided orders"
          color="rose"
        />
      </div>

      {/* Control Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ACTIVE', label: 'Active Orders' },
              { id: 'ALL', label: 'All History' },
              { id: 'NEW', label: 'New' },
              { id: 'ACCEPTED', label: 'Accepted' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'READY', label: 'Ready' },
              { id: 'SERVED', label: 'Served' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex p-0.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Order Type Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by order number (e.g. ORD-2026...), table, or customer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full sm:w-40 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Order Types</option>
              <option value="DINE_IN">Dine-In</option>
              <option value="TAKEAWAY">Takeaway</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            There are currently no orders matching your selected filters. Create a new POS order to start taking tickets.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/pos')}>
            Open POS Register
          </Button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const itemCount = order.itemCount || order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-lg group"
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-emerald-400">{order.orderType.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="font-medium text-white">
                      {order.tableNumber ? `Table ${order.tableNumber} (${order.floorName || 'Floor'})` : order.customerName || 'Walk-in'}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800/80 space-y-1 text-xs">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    {itemCount} total item(s):
                  </div>
                  <div className="space-y-0.5">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-300 text-[11px]">
                        <span className="truncate flex-1">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span className="font-semibold text-slate-400 ml-2">
                          ${Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="text-[10px] text-slate-500 font-medium italic pt-0.5">
                        +{order.items.length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Total & Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Total</span>
                    <span className="text-base font-black text-emerald-400">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick advance status buttons */}
                    {order.status === 'NEW' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(order.id, 'ACCEPTED')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors"
                        title="Accept Order"
                      >
                        Accept
                      </button>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(order.id, 'PREPARING')}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                        title="Start Cooking"
                      >
                        <ChefHat className="w-3 h-3" /> Cook
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(order.id, 'READY')}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                        title="Mark Ready"
                      >
                        <Bell className="w-3 h-3" /> Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(order.id, 'SERVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors"
                        title="Mark Served"
                      >
                        Served
                      </button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Table / Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => {
                  const itemCount = order.itemCount || order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{order.orderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {order.orderType.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || 'Walk-in'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{itemCount} pcs</td>
                      <td className="py-3 px-4 font-bold text-white">${Number(order.totalAmount).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalElements={totalElements}
          pageSize={pageSize}
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
        onOrderUpdated={() => {
          fetchOrders();
          fetchStats();
        }}
      />
    </div>
  );
};
