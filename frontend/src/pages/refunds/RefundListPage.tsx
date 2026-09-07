import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRefundsByOutlet } from '@/api/inventory';
import { RefundTransaction } from '@/types/inventory';
import { ProcessRefundModal } from './ProcessRefundModal';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import {
  RotateCcw,
  Search,
  RefreshCw,
  Plus,
  DollarSign,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { formatDateTime } from '@/utils/format';

export const RefundListPage: React.FC = () => {
  const { user } = useAuth();
  const outletId = user?.outletId || '';

  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchRefunds = useCallback(async () => {
    if (!outletId) return;
    setIsLoading(true);
    try {
      const data = await getRefundsByOutlet(outletId);
      setRefunds(data);
    } catch (err) {
      console.error('Failed to load refunds', err);
    } finally {
      setIsLoading(false);
    }
  }, [outletId]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const filteredRefunds = refunds.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.billNumber && r.billNumber.toLowerCase().includes(q)) ||
      (r.reason && r.reason.toLowerCase().includes(q)) ||
      (r.paymentMethod && r.paymentMethod.toLowerCase().includes(q)) ||
      (r.createdByName && r.createdByName.toLowerCase().includes(q))
    );
  });

  const totalRefundAmount = refunds.reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-emerald-600" />
            Refunds & Reversals Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track authorized payment refunds, balance restorations, and customer reconciliation audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRefunds} className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Process Refund
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Refunds Issued"
          value={`$${totalRefundAmount.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-rose-600" />}
          description="Reversed payment volume"
        />
        <StatCard
          title="Refund Transactions"
          value={refunds.length}
          icon={<FileCheck className="w-5 h-5 text-indigo-600" />}
          description="Settlement ledger reversals"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Bill #, reason, tender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredRefunds.length} of {refunds.length} records
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Bill Reference</th>
                <th className="py-3 px-4">Tender</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Processed By</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading refund ledger...
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No refund transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref) => {
                  const dateStr = formatDateTime(ref.createdAt);

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 font-mono text-xs flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-slate-400" />
                          {ref.billNumber || 'Unlinked'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                          {ref.paymentMethod || 'PAYMENT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 text-sm">
                        -${Number(ref.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {ref.reason}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {ref.createdByName || 'System'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ProcessRefundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRefunds}
      />
    </div>
  );
};
