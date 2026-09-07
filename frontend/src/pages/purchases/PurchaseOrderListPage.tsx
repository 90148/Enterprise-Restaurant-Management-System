import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPurchaseOrders, receivePurchaseOrder } from '@/api/inventory';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/inventory';
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import { Pagination } from '@/components/common/Pagination';
import {
  Truck,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  DollarSign,
} from 'lucide-react';
import { formatDateTime } from '@/utils/format';

export const PurchaseOrderListPage: React.FC = () => {
  const { user } = useAuth();
  const outletId = user?.outletId || '';

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 12;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const fetchPOs = useCallback(async () => {
    if (!outletId) return;
    setIsLoading(true);
    try {
      const res = await getPurchaseOrders({
        outletId,
        status: statusFilter !== 'ALL' ? (statusFilter as PurchaseOrderStatus) : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        size: pageSize,
      });
      setOrders(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load purchase orders', err);
    } finally {
      setIsLoading(false);
    }
  }, [outletId, statusFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  const handleQuickReceive = async (po: PurchaseOrder) => {
    if (!window.confirm(`Receive and restock PO ${po.poNumber}?`)) return;
    try {
      await receivePurchaseOrder(po.id);
      fetchPOs();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to receive purchase order');
    }
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Received
          </span>
        );
      case 'ORDERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            Pending Delivery
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Quick summary counts
  const orderedCount = orders.filter((o) => o.status === 'ORDERED').length;
  const totalValuation = orders.reduce((acc, o) => acc + Number(o.totalAmount), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-emerald-600" />
            Purchasing & Vendor Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Procure stock from food suppliers, record delivery manifests, and recalculate unit costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPOs} className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Purchase Orders"
          value={totalElements}
          icon={<FileText className="w-5 h-5 text-indigo-600" />}
          description="Total lifetime orders"
        />
        <StatCard
          title="Pending Restock Deliveries"
          value={orderedCount}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          description="Awaiting physical check-in"
        />
        <StatCard
          title="Recent Purchases Total"
          value={`$${totalValuation.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          description="On this page"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, supplier name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Orders', value: 'ALL' },
            { label: 'Pending Delivery', value: 'ORDERED' },
            { label: 'Received & Restocked', value: 'RECEIVED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No purchase orders found matching this filter.
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const dateStr = formatDateTime(po.createdAt);

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {po.poNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{po.supplierName}</div>
                        {po.supplierContact && (
                          <div className="text-xs text-slate-400">{po.supplierContact}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {po.items?.length || 0} items
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                        ${Number(po.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(po.status)}</td>
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">{dateStr}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPo(po)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {po.status === 'ORDERED' && (
                            <button
                              onClick={() => handleQuickReceive(po)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Receive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePurchaseOrderModal
        outletId={outletId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchPOs}
      />

      <PurchaseOrderDetailModal
        po={selectedPo}
        isOpen={Boolean(selectedPo)}
        onClose={() => setSelectedPo(null)}
        onSuccess={fetchPOs}
      />
    </div>
  );
};
