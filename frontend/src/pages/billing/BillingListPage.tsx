import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getBills, getBillingStats } from '@/api/billing';
import { Bill, BillStatus, BillingStats } from '@/types/billing';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import { Pagination } from '@/components/common/Pagination';
import {
  Receipt,
  Search,
  RefreshCw,
  Printer,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Table as TableIcon,
} from 'lucide-react';

export const BillingListPage: React.FC = () => {
  const { user } = useAuth();
  const outletId = user?.outletId || '';

  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 12;

  // Active Modals
  const [activePaymentBill, setActivePaymentBill] = useState<Bill | null>(null);
  const [activeReceiptBill, setActiveReceiptBill] = useState<Bill | null>(null);

  const fetchStats = useCallback(async () => {
    if (!outletId) return;
    try {
      const s = await getBillingStats(outletId);
      setStats(s);
    } catch (err) {
      console.error('Failed to load billing stats', err);
    }
  }, [outletId]);

  const fetchBills = useCallback(async () => {
    if (!outletId) return;
    setIsLoading(true);
    try {
      const res = await getBills({
        outletId,
        status: statusFilter !== 'ALL' ? (statusFilter as BillStatus) : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        size: pageSize,
      });
      setBills(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to fetch bills', err);
    } finally {
      setIsLoading(false);
    }
  }, [outletId, statusFilter, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    fetchStats();
    fetchBills();
  }, [fetchStats, fetchBills]);

  const handlePaymentCompleted = (updatedBill: Bill) => {
    setActivePaymentBill(null);
    fetchBills();
    fetchStats();
    // Prompt receipt preview upon settlement
    setActiveReceiptBill(updatedBill);
  };

  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            PARTIAL
          </span>
        );
      case 'UNPAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            UNPAID
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-600" />
            <span>Billing &amp; Settlement</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer bills, process split tender payments, and print 80mm tax invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              fetchStats();
              fetchBills();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Bills"
          value={stats?.totalBillsToday ?? 0}
          icon={<Receipt className="w-5 h-5 text-blue-600" />}
          color="blue"
          description="Invoices created today"
        />
        <StatCard
          title="Pending Settlement"
          value={stats?.unpaidBills ?? 0}
          icon={<Clock className="w-5 h-5 text-rose-600" />}
          color="rose"
          description="Unpaid & partial bills"
        />
        <StatCard
          title="Settled Bills"
          value={stats?.paidBills ?? 0}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          color="emerald"
          description="Fully settled today"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${Number(stats?.todayRevenue ?? 0).toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
          color="purple"
          description="Total collections today"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Bills' },
            { id: 'UNPAID', label: 'Unpaid' },
            { id: 'PARTIALLY_PAID', label: 'Partial' },
            { id: 'PAID', label: 'Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bill or order #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-xs font-semibold">Loading bills...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-4">
            <Receipt className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Bills Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No bills match the selected status filter or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Order / Table</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bills.map((bill) => {
                  const isFullyPaid = bill.status === 'PAID';
                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {bill.billNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{bill.orderNumber}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {bill.tableNumber ? (
                            <>
                              <TableIcon className="w-3 h-3 text-blue-500" />
                              <span>Table {bill.tableNumber}</span>
                            </>
                          ) : (
                            <span className="uppercase font-bold text-amber-600">{bill.orderType}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{bill.customerName || 'Walk-in Guest'}</p>
                        {bill.customerPhone && (
                          <p className="text-[11px] text-slate-400">{bill.customerPhone}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        ${Number(bill.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                        ${Number(bill.paidAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-600">
                        ${Number(bill.balanceAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(bill.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveReceiptBill(bill)}
                            title="Print Tax Receipt"
                            className="p-1.5 h-8 w-8"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                          </Button>

                          {!isFullyPaid && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setActivePaymentBill(bill)}
                              className="h-8 px-2.5 text-xs font-bold"
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1" />
                              Settle
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            totalElements={totalElements}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* Payment Processing Modal */}
      {activePaymentBill && (
        <PaymentModal
          bill={activePaymentBill}
          onClose={() => setActivePaymentBill(null)}
          onPaymentSuccess={handlePaymentCompleted}
        />
      )}

      {/* Printable Receipt Modal */}
      {activeReceiptBill && (
        <ReceiptModal
          bill={activeReceiptBill}
          onClose={() => setActiveReceiptBill(null)}
        />
      )}
    </div>
  );
};
