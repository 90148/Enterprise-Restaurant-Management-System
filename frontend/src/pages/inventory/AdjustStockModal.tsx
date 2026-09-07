import React, { useState } from 'react';
import { InventoryItem, InventoryTransactionType } from '@/types/inventory';
import { adjustStock } from '@/api/inventory';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AlertCircle, Plus, Minus } from 'lucide-react';

interface AdjustStockModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [delta, setDelta] = useState<string>('');
  const [isNegative, setIsNegative] = useState<boolean>(false);
  const [type, setType] = useState<InventoryTransactionType>('ADJUSTMENT');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const currentStock = Number(item.currentStock);
  const deltaNum = parseFloat(delta) || 0;
  const actualDelta = isNegative ? -Math.abs(deltaNum) : Math.abs(deltaNum);
  const projectedStock = currentStock + actualDelta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delta || deltaNum <= 0) {
      setError('Please enter a valid non-zero adjustment quantity');
      return;
    }
    if (projectedStock < 0) {
      setError(`Cannot reduce stock below zero. Current stock is ${currentStock} ${item.unitSymbol}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adjustStock(item.id, {
        quantityDelta: actualDelta,
        type,
        reason: type,
        notes: notes.trim() || `Manual adjustment: ${isNegative ? '-' : '+'}${Math.abs(deltaNum)} ${item.unitSymbol}`,
      });
      setDelta('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to adjust stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${item.name}`}
      description={`SKU: ${item.sku} • Current Stock: ${currentStock.toFixed(3)} ${item.unitSymbol}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Direction Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
            Adjustment Direction
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setIsNegative(false);
                if (type === 'WASTE') setType('ADJUSTMENT');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                !isNegative
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNegative(true);
                setType('WASTE');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                isNegative
                  ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Minus className="w-4 h-4" />
              Deduct Stock
            </button>
          </div>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
            Reason / Type
          </label>
          <select
            value={type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as InventoryTransactionType)}
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {!isNegative ? (
              <>
                <option value="ADJUSTMENT">Physical Audit Restock / Count Adjustment</option>
                <option value="TRANSFER">Inter-Outlet Stock In</option>
              </>
            ) : (
              <>
                <option value="WASTE">Damaged / Expired Spoilage (Waste)</option>
                <option value="ADJUSTMENT">Audit Count Correction (Deficit)</option>
                <option value="TRANSFER">Inter-Outlet Stock Out</option>
              </>
            )}
          </select>
        </div>

        {/* Quantity Delta Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
            Quantity ({item.unitSymbol})
          </label>
          <Input
            type="number"
            step="0.001"
            min="0.001"
            placeholder="0.000"
            value={delta}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDelta(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Projection summary box */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-500">Projected New Stock:</span>
          <span
            className={`font-mono font-bold text-sm ${
              projectedStock < 0
                ? 'text-rose-600'
                : projectedStock <= Number(item.minimumStock)
                ? 'text-amber-600'
                : 'text-emerald-700'
            }`}
          >
            {projectedStock.toFixed(3)} {item.unitSymbol}
          </span>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
            Notes / Audit Explanation
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            placeholder="Reason for adjustment, batch expiry, damaged container..."
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Confirm Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
