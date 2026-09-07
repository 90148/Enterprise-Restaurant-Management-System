import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { getInventoryItems, createPurchaseOrder } from '@/api/inventory';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Plus, Trash2, AlertCircle, ShoppingCart } from 'lucide-react';

interface CreatePurchaseOrderModalProps {
  outletId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  inventoryItemId: string;
  quantity: string;
  unitCost: string;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  outletId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierContact, setSupplierContact] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [rows, setRows] = useState<ItemRow[]>([
    { inventoryItemId: '', quantity: '1', unitCost: '0' },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && outletId) {
      loadInventoryItems();
    }
  }, [isOpen, outletId]);

  const loadInventoryItems = async () => {
    try {
      const res = await getInventoryItems({ outletId, size: 100 });
      setAvailableItems(res.content);
      if (res.content.length > 0 && rows[0].inventoryItemId === '') {
        setRows([
          {
            inventoryItemId: res.content[0].id,
            quantity: '10',
            unitCost: Number(res.content[0].unitCost).toFixed(2),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load ingredients', err);
    }
  };

  const handleRowChange = (index: number, field: keyof ItemRow, value: string) => {
    const updated = [...rows];
    updated[index][field] = value;

    // If item changed, autofill its current unitCost
    if (field === 'inventoryItemId') {
      const found = availableItems.find((it) => it.id === value);
      if (found) {
        updated[index].unitCost = Number(found.unitCost).toFixed(2);
      }
    }
    setRows(updated);
  };

  const addRow = () => {
    const defaultItem = availableItems[0]?.id || '';
    const defaultCost = availableItems[0]?.unitCost
      ? Number(availableItems[0].unitCost).toFixed(2)
      : '0';
    setRows([...rows, { inventoryItemId: defaultItem, quantity: '5', unitCost: defaultCost }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const calculateGrandTotal = () => {
    return rows.reduce((acc, row) => {
      const q = parseFloat(row.quantity) || 0;
      const c = parseFloat(row.unitCost) || 0;
      return acc + q * c;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('Supplier name is required');
      return;
    }

    // Validate rows
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.inventoryItemId) {
        setError(`Please select an ingredient for item #${i + 1}`);
        return;
      }
      const q = parseFloat(r.quantity);
      if (isNaN(q) || q <= 0) {
        setError(`Quantity for item #${i + 1} must be greater than 0`);
        return;
      }
      const c = parseFloat(r.unitCost);
      if (isNaN(c) || c < 0) {
        setError(`Unit cost for item #${i + 1} cannot be negative`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await createPurchaseOrder({
        outletId,
        supplierName: supplierName.trim(),
        supplierContact: supplierContact.trim() || undefined,
        notes: notes.trim() || undefined,
        items: rows.map((r) => ({
          inventoryItemId: r.inventoryItemId,
          quantity: parseFloat(r.quantity),
          unitCost: parseFloat(r.unitCost),
        })),
      });

      // Reset form
      setSupplierName('');
      setSupplierContact('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = calculateGrandTotal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order"
      description="Procure raw materials & ingredients from suppliers with automated stock receiving."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
              Supplier / Vendor Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Sysco Foods, Fresh Valley Farms"
              value={supplierName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
              Contact / Phone
            </label>
            <Input
              type="text"
              placeholder="e.g. +1-555-0199 or rep@sysco.com"
              value={supplierContact}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierContact(e.target.value)}
            />
          </div>
        </div>

        {/* PO Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Order Items ({rows.length})
            </label>
            <button
              type="button"
              onClick={addRow}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Ingredient
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {rows.map((row, idx) => {
              const subtotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitCost) || 0);

              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                >
                  <div className="col-span-5">
                    <select
                      value={row.inventoryItemId}
                      onChange={(e) => handleRowChange(idx, 'inventoryItemId', e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    >
                      <option value="" disabled>
                        Select Raw Material...
                      </option>
                      {availableItems.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} ({it.unitSymbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                      className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Cost"
                        value={row.unitCost}
                        onChange={(e) => handleRowChange(idx, 'unitCost', e.target.value)}
                        className="w-full h-9 pl-5 pr-1 text-xs bg-white border border-slate-200 rounded-lg font-mono text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-2 text-right font-mono font-semibold text-xs text-slate-800">
                    ${subtotal.toFixed(2)}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={rows.length === 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-sm">
          <span className="font-medium text-emerald-800 flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4" />
            Estimated PO Total:
          </span>
          <span className="font-mono font-bold text-lg text-emerald-900">
            ${grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
            Order Notes / Delivery Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special delivery instructions, dock arrival instructions..."
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating PO...' : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
