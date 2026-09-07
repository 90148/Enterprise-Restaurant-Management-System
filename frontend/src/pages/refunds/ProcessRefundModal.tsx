import React, { useState } from 'react';
import { processRefund } from '@/api/inventory';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPaymentId?: string;
  maxAmount?: number;
}

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPaymentId = '',
  maxAmount,
}) => {
  const [paymentId, setPaymentId] = useState<string>(initialPaymentId);
  const [amount, setAmount] = useState<string>(maxAmount ? String(maxAmount) : '');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialPaymentId) setPaymentId(initialPaymentId);
    if (maxAmount) setAmount(String(maxAmount));
  }, [initialPaymentId, maxAmount, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId.trim()) {
      setError('Payment ID is required');
      return;
    }
    const refundAmt = parseFloat(amount);
    if (isNaN(refundAmt) || refundAmt <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }
    if (maxAmount && refundAmt > maxAmount) {
      setError(`Refund cannot exceed the original payment amount of $${maxAmount.toFixed(2)}`);
      return;
    }
    if (!reason.trim()) {
      setError('Please specify an official reason for the refund');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await processRefund({
        paymentId: paymentId.trim(),
        amount: refundAmt,
        reason: reason.trim(),
      });
      setPaymentId('');
      setAmount('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to process refund. Please check payment ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Customer Refund"
      description="Issue a verified ledger refund for an existing settled payment."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
            Settlement Payment ID *
          </label>
          <Input
            type="text"
            placeholder="Paste Payment UUID from Bill Receipt"
            value={paymentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentId(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
            Refund Amount ($) *
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            required
          />
          {maxAmount && (
            <p className="text-[11px] text-slate-400 mt-1">
              Maximum refundable amount for this payment: ${maxAmount.toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
            Reason for Refund *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            placeholder="e.g. Customer dissatisfied with food quality, duplicate charge reversal..."
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" />
            {loading ? 'Processing...' : 'Authorize Refund'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
