import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  ShoppingBag,
  Receipt,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import {
  getSalesSummary,
  getDailySales,
  getPaymentMethodBreakdown,
  getOrderTypeBreakdown,
  getTopSellingItems,
  getCategorySales,
  downloadSalesReportCsv,
} from '@/api/report';
import { formatCurrency } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';

type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const SalesReportPage: React.FC = () => {
  const { user, activeOutletId } = useAuth();
  const outletId = activeOutletId || user?.outletId || undefined;
  const [preset, setPreset] = useState<DatePreset>('7days');
  const [isExporting, setIsExporting] = useState(false);

  // Compute default dates for 7 days
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [startDate, setStartDate] = useState<string>(sevenDaysAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(now.toISOString().slice(0, 10));

  const handlePresetChange = (selected: DatePreset) => {
    setPreset(selected);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (selected === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (selected === 'yesterday') {
      const yest = new Date();
      yest.setDate(today.getDate() - 1);
      const yestStr = yest.toISOString().slice(0, 10);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (selected === '7days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (selected === '30days') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  const queryParams = {
    outletId: outletId,
    startDate: `${startDate}T00:00:00`,
    endDate: `${endDate}T23:59:59`,
  };

  // 1. Sales Summary
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isRefetching,
  } = useQuery({
    queryKey: ['sales-summary', queryParams],
    queryFn: () => getSalesSummary(queryParams),
  });

  // 2. Daily Sales Trend
  const { data: dailySales } = useQuery({
    queryKey: ['daily-sales', queryParams],
    queryFn: () => getDailySales(queryParams),
  });

  // 3. Payment Methods
  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods', queryParams],
    queryFn: () => getPaymentMethodBreakdown(queryParams),
  });

  // 4. Order Types
  const { data: orderTypes } = useQuery({
    queryKey: ['order-types', queryParams],
    queryFn: () => getOrderTypeBreakdown(queryParams),
  });

  // 5. Top Items
  const { data: topItems } = useQuery({
    queryKey: ['top-items', queryParams],
    queryFn: () => getTopSellingItems({ ...queryParams, limit: 8 }),
  });

  // 6. Categories
  const { data: categories } = useQuery({
    queryKey: ['category-sales', queryParams],
    queryFn: () => getCategorySales(queryParams),
  });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await downloadSalesReportCsv(queryParams);
    } catch (err) {
      console.error('Failed to download CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const tenderPieData = paymentMethods?.map((pm) => ({
    name: pm.paymentMethod,
    value: Number(pm.amount) || 0,
    count: pm.count,
    percentage: pm.percentage,
  })) || [];

  const orderTypePieData = orderTypes?.map((ot) => ({
    name: ot.orderType.replace('_', ' '),
    value: Number(ot.amount) || 0,
    count: ot.count,
    percentage: ot.percentage,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales & Financial Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Revenue breakdown, tender distribution, and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => handlePresetChange('today')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                preset === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetChange('yesterday')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                preset === 'yesterday' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handlePresetChange('7days')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                preset === '7days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePresetChange('30days')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                preset === '30days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPreset('custom')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                preset === 'custom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Export and Refresh Actions */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetchSummary()}
            isLoading={isRefetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            isLoading={isExporting}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Pickers Drawer (when preset === 'custom') */}
      {preset === 'custom' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-end gap-4">
          <div className="w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs"
            />
          </div>
          <p className="text-xs text-slate-500 pb-2">
            Showing transactions from <span className="font-semibold text-slate-700">{startDate}</span> to <span className="font-semibold text-slate-700">{endDate}</span>
          </p>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paid Revenue"
          value={isSummaryLoading ? '...' : formatCurrency(summary?.totalPaid || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          description={`Across ${summary?.totalBills || 0} settled bills`}
          color="emerald"
        />
        <StatCard
          title="Gross Sales"
          value={isSummaryLoading ? '...' : formatCurrency(summary?.grossSales || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          description={`Discounts: ${formatCurrency(summary?.discountTotal || 0)}`}
          color="blue"
        />
        <StatCard
          title="Tax Collected"
          value={isSummaryLoading ? '...' : formatCurrency(summary?.taxTotal || 0)}
          icon={<Receipt className="w-5 h-5" />}
          description="GST & statutory taxes"
          color="purple"
        />
        <StatCard
          title="Average Order Value"
          value={isSummaryLoading ? '...' : formatCurrency(summary?.averageOrderValue || 0)}
          icon={<ShoppingBag className="w-5 h-5" />}
          description={`Total orders: ${summary?.totalOrders || 0}`}
          color="amber"
        />
      </div>

      {/* Daily Revenue Chart */}
      <Card
        title="Daily Revenue Trend"
        subtitle="Revenue trajectory over the selected reporting window"
      >
        <div className="h-72 w-full pt-2">
          {!dailySales || dailySales.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No sales data recorded in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Paid Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="paidAmount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Tender Distribution & Order Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card
          title="Payment Tender Breakdown"
          subtitle="Distribution of collections by tender method"
        >
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-6">
            {tenderPieData.length === 0 ? (
              <div className="text-slate-400 text-xs">No payment records found.</div>
            ) : (
              <>
                <div className="w-52 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenderPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {tenderPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1 text-xs">
                  {tenderPieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{formatCurrency(item.value)}</span>
                        <span className="text-[10px] text-slate-500">
                          {item.count} txns ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Order Types */}
        <Card
          title="Order Type Breakdown"
          subtitle="Revenue share across Dine-in, Takeaway, and Delivery"
        >
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-6">
            {orderTypePieData.length === 0 ? (
              <div className="text-slate-400 text-xs">No completed orders found.</div>
            ) : (
              <>
                <div className="w-52 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {orderTypePieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1 text-xs">
                  {orderTypePieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }}
                        />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{formatCurrency(item.value)}</span>
                        <span className="text-[10px] text-slate-500">
                          {item.count} orders ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Top Selling Items & Category Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card
          title="Top Selling Dishes"
          subtitle="Highest grossing menu items by volume and revenue"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">#</th>
                  <th className="py-2.5 px-3 font-semibold">Dish</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Sold</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!topItems || topItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  topItems.map((item, index) => (
                    <tr key={item.itemName} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.itemName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.categoryName}</td>
                      <td className="py-2.5 px-3 font-medium text-right text-slate-700">{item.quantitySold}</td>
                      <td className="py-2.5 px-3 font-bold text-right text-emerald-700">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Category Performance */}
        <Card
          title="Category Performance"
          subtitle="Revenue contribution by menu category"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Items Sold</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Revenue</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!categories || categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No category sales recorded.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.categoryId || cat.categoryName} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{cat.categoryName}</td>
                      <td className="py-2.5 px-3 font-medium text-right text-slate-700">{cat.itemsSold}</td>
                      <td className="py-2.5 px-3 font-bold text-right text-emerald-700">
                        {formatCurrency(cat.totalRevenue)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-right text-slate-600">
                        {cat.revenueSharePercentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesReportPage;
