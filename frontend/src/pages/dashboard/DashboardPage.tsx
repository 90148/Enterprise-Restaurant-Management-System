import React from 'react';
import { DollarSign, Clock, CheckCircle2, Grid, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/common/Card';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-xs text-slate-500 mt-1">Live metrics and operations for current outlet</p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value="$2,450.00"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 12.5, isPositive: true }}
          description="vs. yesterday"
          color="emerald"
        />
        <StatCard
          title="Active Tables"
          value="8 / 20"
          icon={<Grid className="w-5 h-5" />}
          description="12 tables available"
          color="blue"
        />
        <StatCard
          title="Live Orders"
          value="5"
          icon={<Clock className="w-5 h-5" />}
          description="In kitchen / preparation"
          color="amber"
        />
        <StatCard
          title="Completed Orders"
          value="42"
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend={{ value: 8.4, isPositive: true }}
          description="Today's orders served"
          color="purple"
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Sales & Order Trends" subtitle="Hourly breakdown of today's transactions">
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
              Sales trend chart will populate with live backend transactions.
            </div>
          </Card>
        </div>

        <div>
          <Card title="Inventory Alerts" subtitle="Low stock and re-order thresholds">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-900">Basmati Rice</span>
                </div>
                <span className="text-amber-700 font-medium">4.5 kg remaining</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-rose-900">Fresh Cream</span>
                </div>
                <span className="text-rose-700 font-medium">0.8 L remaining</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
