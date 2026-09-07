import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Receipt,
  Percent,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import {
  getOutletSettings,
  updateOutletSettings,
  getTaxes,
  createTax,
  updateTax,
  deleteTax,
} from '@/api/setting';
import { OutletSettings, Tax } from '@/types/setting';
import { useAuth } from '@/context/AuthContext';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, activeOutletId } = useAuth();
  const outletId = activeOutletId || user?.outletId || undefined;
  const [activeTab, setActiveTab] = useState<'profile' | 'taxes' | 'receipt'>('profile');

  // Form state
  const [form, setForm] = useState<OutletSettings>({
    outletId: '',
    restaurantName: '',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'UTC',
    defaultServiceCharge: 0,
    receiptHeader: '',
    receiptFooter: 'Thank you for dining with us! Please visit again.',
    taxNumber: '',
    autoPrintReceipt: false,
    defaultOrderType: 'DINE_IN',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tax Modal state
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxName, setTaxName] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [taxActive, setTaxActive] = useState(true);

  // Fetch Settings
  const { data: settingsData } = useQuery({
    queryKey: ['outlet-settings', outletId],
    queryFn: () => getOutletSettings(outletId),
  });

  // Fetch Taxes
  const { data: taxes, isLoading: isTaxesLoading } = useQuery({
    queryKey: ['taxes', outletId],
    queryFn: () => getTaxes(outletId),
  });

  useEffect(() => {
    if (settingsData) {
      setForm(settingsData);
    }
  }, [settingsData]);

  const saveSettingsMutation = useMutation({
    mutationFn: (data: Partial<OutletSettings>) => updateOutletSettings(data, outletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlet-settings'] });
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to save settings',
      });
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const saveTaxMutation = useMutation({
    mutationFn: async () => {
      if (editingTax) {
        return updateTax(editingTax.id, {
          name: taxName,
          percentage: Number(taxPercentage),
          inclusive: taxInclusive,
          active: taxActive,
        });
      } else {
        return createTax({
          outletId: outletId,
          name: taxName,
          percentage: Number(taxPercentage),
          inclusive: taxInclusive,
          active: taxActive,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      setIsTaxModalOpen(false);
      setEditingTax(null);
    },
  });

  const deleteTaxMutation = useMutation({
    mutationFn: (id: string) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });

  const handleOpenTaxModal = (tax?: Tax) => {
    if (tax) {
      setEditingTax(tax);
      setTaxName(tax.name);
      setTaxPercentage(tax.percentage.toString());
      setTaxInclusive(tax.inclusive);
      setTaxActive(tax.active);
    } else {
      setEditingTax(null);
      setTaxName('');
      setTaxPercentage('');
      setTaxInclusive(false);
      setTaxActive(true);
    }
    setIsTaxModalOpen(true);
  };

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Preferences & Settings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure outlet profile, currency, statutory taxes, and thermal receipts
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSaveSettings}
          isLoading={saveSettingsMutation.isPending}
          className="flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Store & Currency</span>
        </button>

        <button
          onClick={() => setActiveTab('taxes')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'taxes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Taxes & Charges</span>
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'receipt'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Thermal Receipts</span>
        </button>
      </div>

      {/* Tab 1: Store & Currency */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Restaurant Profile" subtitle="General store identity and regional formatting">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Restaurant / Outlet Name</label>
                <Input
                  value={form.restaurantName}
                  onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                  placeholder="e.g. RestoMaster Flagship"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                  <Input
                    value={form.currencySymbol}
                    onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                    placeholder="e.g. $"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                  <Input
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    placeholder="e.g. Asia/Kolkata, UTC"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Order Type</label>
                  <select
                    value={form.defaultOrderType}
                    onChange={(e) => setForm({ ...form, defaultOrderType: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="DINE_IN">Dine-In</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.autoPrintReceipt}
                    onChange={(e) => setForm({ ...form, autoPrintReceipt: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Auto-open printable receipt modal upon order settlement</span>
                </label>
              </div>
            </div>
          </Card>

          <Card title="Current Outlet Details" subtitle="Fixed metadata associated with this terminal">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Terminal Outlet ID</span>
                <span className="font-mono text-slate-800 font-semibold">{outletId || 'Primary Default'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Location Code</span>
                <span className="font-mono text-slate-800 font-semibold">MAIN-01</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Operating Hours</span>
                <span className="text-slate-800 font-semibold">09:00 - 23:00</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Taxes & Service Charges */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <Card
            title="Statutory Taxes"
            subtitle="Configured tax rules applied automatically during invoice generation"
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenTaxModal()}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tax Rate</span>
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Tax Name</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Rate (%)</th>
                    <th className="py-2.5 px-3 font-semibold">Calculation</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isTaxesLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Loading tax rules...
                      </td>
                    </tr>
                  ) : !taxes || taxes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No taxes configured. Click &quot;Add Tax Rate&quot; to set up GST/VAT.
                      </td>
                    </tr>
                  ) : (
                    taxes.map((tax) => (
                      <tr key={tax.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{tax.name}</td>
                        <td className="py-2.5 px-3 font-bold text-right text-slate-900">{tax.percentage}%</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tax.inclusive ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tax.inclusive ? 'Inclusive in Menu' : 'Added to Subtotal'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tax.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {tax.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenTaxModal(tax)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTaxMutation.mutate(tax.id)}
                              className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded"
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
          </Card>

          <Card title="Service Charge Configuration" subtitle="Optional hospitality charge applied to Dine-In bills">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Service Charge (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.defaultServiceCharge}
                  onChange={(e) => setForm({ ...form, defaultServiceCharge: Number(e.target.value) || 0 })}
                  placeholder="e.g. 5.0"
                />
                <p className="text-[11px] text-slate-400 mt-1">Set to 0 if service charges are not applicable.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Receipt Customization */}
      {activeTab === 'receipt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Receipt Layout & Branding" subtitle="Text shown on thermal printed guest checks">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax ID / GSTIN Number</label>
                <Input
                  value={form.taxNumber || ''}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  placeholder="e.g. 29AAAAA0000A1Z5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Header Note</label>
                <textarea
                  value={form.receiptHeader || ''}
                  onChange={(e) => setForm({ ...form, receiptHeader: e.target.value })}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Welcome to RestoMaster! 123 Gourmet Ave, Food City"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer Note</label>
                <textarea
                  value={form.receiptFooter || ''}
                  onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Thank you for dining with us! Please visit again."
                />
              </div>
            </div>
          </Card>

          {/* 80mm Thermal Receipt Live Preview */}
          <Card title="80mm Thermal Slip Preview" subtitle="Real-time rendering of your guest check design">
            <div className="bg-slate-100 p-4 rounded-xl flex justify-center">
              <div className="w-72 bg-white p-5 rounded shadow-sm border border-slate-300 font-mono text-[11px] leading-tight text-slate-900 space-y-3">
                <div className="text-center space-y-1">
                  <p className="font-bold text-sm tracking-wider uppercase">
                    {form.restaurantName || 'RESTOMASTER POS'}
                  </p>
                  <p className="text-[10px] text-slate-600 whitespace-pre-line">
                    {form.receiptHeader || '100 Culinary Blvd, Suite 4\nTel: (555) 019-2831'}
                  </p>
                  {form.taxNumber && (
                    <p className="text-[10px] text-slate-500">GSTIN: {form.taxNumber}</p>
                  )}
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-1.5 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Order: #ORD-SAMPLE</span>
                    <span>Table: T-04</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date: {new Date().toLocaleDateString()}</span>
                    <span>Server: John</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>1x Truffle Risotto</span>
                    <span>{form.currencySymbol}24.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Classic Mojito</span>
                    <span>{form.currencySymbol}16.00</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{form.currencySymbol}40.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (5%):</span>
                    <span>{form.currencySymbol}2.00</span>
                  </div>
                  {form.defaultServiceCharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Service ({form.defaultServiceCharge}%):</span>
                      <span>{form.currencySymbol}{(40 * (form.defaultServiceCharge / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-400">
                    <span>TOTAL:</span>
                    <span>
                      {form.currencySymbol}
                      {(42 + 40 * (form.defaultServiceCharge / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-600 whitespace-pre-line">
                  {form.receiptFooter}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tax Add/Edit Modal */}
      <Modal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        title={editingTax ? 'Edit Tax Rate' : 'Add New Tax Rate'}
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Name</label>
            <Input
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="e.g. CGST, SGST, VAT"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Percentage Rate (%)</label>
            <Input
              type="number"
              step="0.01"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              placeholder="e.g. 5.00"
            />
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={taxInclusive}
                onChange={(e) => setTaxInclusive(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Tax is inclusive in menu prices</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={taxActive}
                onChange={(e) => setTaxActive(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Active and applied to new bills</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsTaxModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => saveTaxMutation.mutate()}
              isLoading={saveTaxMutation.isPending}
              disabled={!taxName || !taxPercentage}
            >
              {editingTax ? 'Update Tax' : 'Create Tax'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
