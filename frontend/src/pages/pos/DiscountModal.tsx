import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Percent, DollarSign, Tag, AlertCircle } from 'lucide-react';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  currentDiscount: number;
  onApplyDiscount: (type: 'PERCENTAGE' | 'FIXED', value: number, reason: string) => void;
  onRemoveDiscount: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  currentDiscount,
  onApplyDiscount,
  onRemoveDiscount,
}) => {
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [reason, setReason] = useState<string>('Happy Hour');
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    'Happy Hour',
    'Manager Courtesy',
    'Loyalty Reward',
    'Staff Meal',
    'Service Recovery',
    'Promotional Event',
  ];

  const parsedValue = parseFloat(discountValue) || 0;
  let calculatedDiscount = 0;
  if (discountType === 'PERCENTAGE') {
    calculatedDiscount = (subtotal * parsedValue) / 100;
  } else {
    calculatedDiscount = parsedValue;
  }
  calculatedDiscount = Math.min(calculatedDiscount, subtotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedValue <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }
    if (discountType === 'PERCENTAGE' && parsedValue > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }
    if (discountType === 'FIXED' && parsedValue > subtotal) {
      setError('Fixed discount cannot exceed the subtotal');
      return;
    }

    onApplyDiscount(discountType, parsedValue, reason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Order Discount" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setDiscountType('PERCENTAGE');
              setDiscountValue('10');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              discountType === 'PERCENTAGE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Percentage (%)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDiscountType('FIXED');
              setDiscountValue('5');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              discountType === 'FIXED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fixed Amount ($)</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">Quick Presets</label>
          <div className="grid grid-cols-4 gap-2">
            {discountType === 'PERCENTAGE'
              ? [5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDiscountValue(pct.toString());
                      setError(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      discountValue === pct.toString()
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {pct}%
                  </button>
                ))
              : [5, 10, 15, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDiscountValue(amt.toString());
                      setError(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      discountValue === amt.toString()
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {discountType === 'PERCENTAGE' ? 'Percentage Value' : 'Discount Dollar Amount'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              max={discountType === 'PERCENTAGE' ? 100 : subtotal}
              value={discountValue}
              onChange={(e) => {
                setDiscountValue(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
            <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
              {discountType === 'PERCENTAGE' ? '%' : '$'}
            </div>
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Reason for Discount</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                  reason === r
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Custom reason"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Calculation Preview */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Discount Savings:
            </span>
            <span className="font-bold">-${calculatedDiscount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-1.5 border-t border-slate-800 font-bold">
            <span>New Subtotal:</span>
            <span>${(subtotal - calculatedDiscount).toFixed(2)}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {currentDiscount > 0 ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                onRemoveDiscount();
                onClose();
              }}
            >
              Remove Discount
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Apply Discount
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
