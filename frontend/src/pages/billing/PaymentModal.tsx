import React, { useState } from 'react';
import { Bill, PaymentMethod } from '@/types/billing';
import { processPayment } from '@/api/billing';
import { Button } from '@/components/common/Button';
import {
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  CheckCircle2,
  X,
  Coins,
  AlertCircle,
} from 'lucide-react';

interface PaymentModalProps {
  bill: Bill | null;
  onClose: () => void;
  onPaymentSuccess: (updatedBill: Bill) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bill,
  onClose,
  onPaymentSuccess,
}) => {
  if (!bill) return null;

  const remainingBalance = Number(bill.balanceAmount);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [payAmount, setPayAmount] = useState<string>(remainingBalance.toFixed(2));
  const [tenderedAmount, setTenderedAmount] = useState<string>(remainingBalance.toFixed(2));
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const numPayAmount = parseFloat(payAmount) || 0;
  const numTendered = parseFloat(tenderedAmount) || 0;
  const changeAmount = paymentMethod === 'CASH' && numTendered > numPayAmount
    ? numTendered - numPayAmount
    : 0;

  const handleQuickCash = (amount: number) => {
    setTenderedAmount(amount.toFixed(2));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numPayAmount <= 0) {
      setErrorMsg('Payment amount must be greater than $0.00');
      return;
    }
    if (numPayAmount > remainingBalance) {
      setErrorMsg(`Payment amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`);
      return;
    }
    if (paymentMethod === 'CASH' && numTendered < numPayAmount) {
      setErrorMsg('Cash tendered must be at least equal to payment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await processPayment(bill.id, {
        amount: numPayAmount,
        tenderedAmount: paymentMethod === 'CASH' ? numTendered : undefined,
        paymentMethod,
        transactionRef: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onPaymentSuccess(updated);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error?.response?.data?.message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <span>Settle Payment • {bill.billNumber}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Order {bill.orderNumber} {bill.tableNumber ? `• Table ${bill.tableNumber}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Banner */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Due</p>
            <p className="text-2xl font-black">${Number(bill.totalAmount).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Remaining Balance</p>
            <p className="text-2xl font-black text-emerald-400">${remainingBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePay} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tender Method Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { method: 'CASH' as PaymentMethod, label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
                { method: 'CARD' as PaymentMethod, label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
                { method: 'UPI' as PaymentMethod, label: 'UPI / QR', icon: <QrCode className="w-5 h-5" /> },
                { method: 'WALLET' as PaymentMethod, label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
              ].map(({ method, label, icon }) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method !== 'CASH') {
                        setTenderedAmount(payAmount);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                    <span className="mt-1.5">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount to Pay (Split Support) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Amount to Pay ($)
              </label>
              <button
                type="button"
                onClick={() => {
                  setPayAmount(remainingBalance.toFixed(2));
                  setTenderedAmount(remainingBalance.toFixed(2));
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Pay Full Balance
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={payAmount}
              onChange={(e) => {
                setPayAmount(e.target.value);
                if (paymentMethod !== 'CASH') {
                  setTenderedAmount(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Cash Specific Details: Tendered & Quick Cash */}
          {paymentMethod === 'CASH' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Cash Tendered ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={numPayAmount}
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick:</span>
                {[numPayAmount, 10, 20, 50, 100].map((val, idx) => {
                  if (val < numPayAmount && idx !== 0) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickCash(val)}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors"
                    >
                      {idx === 0 ? 'Exact' : `$${val}`}
                    </button>
                  );
                })}
              </div>

              {/* Change Display */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Change Due:</span>
                <span className="text-base font-black text-emerald-600">
                  ${changeAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Card / UPI Reference Number */}
          {paymentMethod !== 'CASH' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {paymentMethod === 'CARD' ? 'Card Authorization / Slip No' : 'UPI / Transaction Reference'}
              </label>
              <input
                type="text"
                placeholder="e.g. AUTH-882310 or UPI-Ref-0091"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Notes input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split payment, customer coupon applied..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || numPayAmount <= 0}
              className="px-6"
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Confirm &amp; Settle ${numPayAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
