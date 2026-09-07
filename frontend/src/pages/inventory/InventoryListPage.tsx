import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getInventoryItems,
  getInventoryStats,
  getOutletTransactions,
} from '@/api/inventory';
import {
  InventoryItem,
  InventoryStats,
  InventoryTransaction,
  InventoryStatus,
} from '@/types/inventory';
import { AdjustStockModal } from './AdjustStockModal';
import { ItemHistoryModal } from './ItemHistoryModal';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import { Pagination } from '@/components/common/Pagination';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertTriangle,
  XCircle,
  DollarSign,
  History,
  SlidersHorizontal,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatDateTime } from '@/utils/format';

export const InventoryListPage: React.FC = () => {
  const { user } = useAuth();
  const outletId = user?.outletId || '';

  const [activeTab, setActiveTab] = useState<'items' | 'ledger'>('items');
  const [stats, setStats] = useState<InventoryStats | null>(null);

  // Items State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemPage, setItemPage] = useState<number>(0);
  const [itemTotalPages, setItemTotalPages] = useState<number>(0);
  const [itemTotalElements, setItemTotalElements] = useState<number>(0);
  const itemPageSize = 12;

  // Ledger State
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);
  const [ledgerPage, setLedgerPage] = useState<number>(0);
  const [ledgerTotalPages, setLedgerTotalPages] = useState<number>(0);
  const [ledgerTotalElements, setLedgerTotalElements] = useState<number>(0);
  const ledgerPageSize = 15;

  // Modals
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InventoryItem | null>(null);

  const fetchStats = useCallback(async () => {
    if (!outletId) return;
    try {
      const s = await getInventoryStats(outletId);
      setStats(s);
    } catch (err) {
      console.error('Failed to load inventory stats', err);
    }
  }, [outletId]);

  const fetchItems = useCallback(async () => {
    if (!outletId) return;
    setItemsLoading(true);
    try {
      const res = await getInventoryItems({
        outletId,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: itemPage,
        size: itemPageSize,
      });
      setItems(res.content);
      setItemTotalPages(res.totalPages);
      setItemTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load inventory items', err);
    } finally {
      setItemsLoading(false);
    }
  }, [outletId, statusFilter, searchQuery, itemPage]);

  const fetchLedger = useCallback(async () => {
    if (!outletId) return;
    setLedgerLoading(true);
    try {
      const res = await getOutletTransactions(outletId, ledgerPage, ledgerPageSize);
      setTransactions(res.content);
      setLedgerTotalPages(res.totalPages);
      setLedgerTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load transaction ledger', err);
    } finally {
      setLedgerLoading(false);
    }
  }, [outletId, ledgerPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'items') {
      fetchItems();
    } else {
      fetchLedger();
    }
  }, [activeTab, fetchItems, fetchLedger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setItemPage(0);
    fetchItems();
  };

  const getStatusBadge = (status: InventoryStatus, current: number, min: number) => {
    if (status === 'OUT_OF_STOCK' || current <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          <XCircle className="w-3.5 h-3.5" />
          Out of Stock
        </span>
      );
    }
    if (status === 'LOW_STOCK' || current <= min) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        Optimal
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-emerald-600" />
            Inventory & Stock Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock tracking, recipe ingredient consumption, adjustments and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchStats();
              if (activeTab === 'items') fetchItems();
              else fetchLedger();
            }}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Raw Items"
          value={stats ? stats.totalItems : '—'}
          icon={<Package className="w-5 h-5 text-indigo-600" />}
          description="Catalog items"
        />
        <StatCard
          title="Low Stock Warning"
          value={stats ? stats.lowStockCount : '—'}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          description="Below threshold"
        />
        <StatCard
          title="Out of Stock"
          value={stats ? stats.outOfStockCount : '—'}
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
          description="Immediate reorder needed"
        />
        <StatCard
          title="Total Stock Value"
          value={stats ? `$${Number(stats.totalValuation).toFixed(2)}` : '—'}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          description="Inventory valuation"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'items'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Raw Ingredients Catalog
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Audit Ledger & Movements
        </button>
      </div>

      {/* Tab: Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ingredient name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </form>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { label: 'All Items', value: 'ALL' },
                { label: 'Normal', value: 'NORMAL' },
                { label: 'Low Stock', value: 'LOW_STOCK' },
                { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setItemPage(0);
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

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Min. Threshold</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Unit Cost</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading inventory catalog...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No raw inventory items found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const cur = Number(item.currentStock);
                      const min = Number(item.minimumStock);
                      const cost = Number(item.unitCost);
                      const totalVal = cur * cost;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {item.sku} • {item.unitName}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {cur.toFixed(3)}
                            </span>{' '}
                            <span className="text-xs text-slate-500">{item.unitSymbol}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                            {min.toFixed(3)} {item.unitSymbol}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(item.status, cur, min)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 text-xs">
                            ${cost.toFixed(2)} / {item.unitSymbol}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-xs">
                            ${totalVal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedAdjustItem(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Adjust
                              </button>
                              <button
                                onClick={() => setSelectedHistoryItem(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                                Audit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {itemTotalPages > 1 && (
              <div className="p-4 border-t border-slate-200">
                <Pagination
                  currentPage={itemPage}
                  totalPages={itemTotalPages}
                  totalElements={itemTotalElements}
                  pageSize={itemPageSize}
                  onPageChange={setItemPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Quantity Changed</th>
                  <th className="py-3 px-4">Remaining Stock</th>
                  <th className="py-3 px-4">Notes / Reference</th>
                  <th className="py-3 px-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading audit ledger...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const qty = Number(tx.quantityChanged);
                    const isPositive = qty > 0;
                    const dateStr = formatDateTime(tx.createdAt);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                          {dateStr}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                          {tx.inventoryItemName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                              tx.transactionType === 'SALE'
                                ? 'bg-indigo-100 text-indigo-700'
                                : tx.transactionType === 'PURCHASE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : tx.transactionType === 'WASTE'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? `+${qty.toFixed(3)}` : qty.toFixed(3)} {tx.unitSymbol}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-700">
                          {Number(tx.remainingStock).toFixed(3)} {tx.unitSymbol}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {tx.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {tx.createdByName || 'System'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {ledgerTotalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={ledgerPage}
                totalPages={ledgerTotalPages}
                totalElements={ledgerTotalElements}
                pageSize={ledgerPageSize}
                onPageChange={setLedgerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AdjustStockModal
        item={selectedAdjustItem}
        isOpen={Boolean(selectedAdjustItem)}
        onClose={() => setSelectedAdjustItem(null)}
        onSuccess={() => {
          fetchStats();
          fetchItems();
        }}
      />

      <ItemHistoryModal
        item={selectedHistoryItem}
        isOpen={Boolean(selectedHistoryItem)}
        onClose={() => setSelectedHistoryItem(null)}
      />
    </div>
  );
};
