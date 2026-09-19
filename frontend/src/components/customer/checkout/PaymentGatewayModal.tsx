import React, { useState } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  Building2,
  Wallet,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { PaymentMethodType, CustomerOrder } from '@/types/customer';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { useCustomerContext } from '@/context/CustomerContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: CustomerOrder) => void;
  specialInstructions?: string;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  specialInstructions,
}) => {
  const { cartSummary } = useCustomerCartContext();
  const { placeOrder } = useCustomerOrders();
  const { orderType, activeTable } = useCustomerContext();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Card inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // UPI App selector
  const [upiApp, setUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'QR'>('QR');

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);

      setTimeout(() => {
        const order = placeOrder(selectedMethod, specialInstructions);
        setIsDone(false);
        onSuccess(order);
      }, 700);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Secure Payment Gateway</h3>
              <p className="text-[11px] text-slate-400">256-Bit SSL Encrypted Restaurant Checkout</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Amount Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Payable Amount</span>
            <span className="text-xl font-extrabold text-white">₹{cartSummary.grandTotal}</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg">
            {orderType === 'DINE_IN' ? `Table ${activeTable || 'T-12'}` : orderType}
          </span>
        </div>

        {/* Payment Tabs & Forms */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Method Selection Tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'UPI', label: 'Instant UPI', icon: QrCode },
              { type: 'CARD', label: 'Credit / Debit', icon: CreditCard },
              { type: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
              { type: 'WALLET', label: 'Wallets', icon: Wallet },
              {
                type: orderType === 'DINE_IN' ? 'COUNTER' : 'CASH',
                label: orderType === 'DINE_IN' ? 'Pay at Counter' : 'Cash on Delivery',
                icon: Banknote,
              },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMethod === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setSelectedMethod(m.type as PaymentMethodType)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Specific to Method */}
          {selectedMethod === 'UPI' && (
            <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <div className="flex justify-center gap-2">
                {[
                  { key: 'QR', label: 'Scan Dynamic QR' },
                  { key: 'GPAY', label: 'Google Pay' },
                  { key: 'PHONEPE', label: 'PhonePe' },
                  { key: 'PAYTM', label: 'Paytm' },
                ].map((u) => (
                  <button
                    key={u.key}
                    type="button"
                    onClick={() => setUpiApp(u.key as any)}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                      upiApp === u.key
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>

              {upiApp === 'QR' ? (
                <div className="space-y-2">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    {/* Simulated High-Res QR Visual */}
                    <div className="w-full h-full border-4 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-slate-950 space-y-1">
                      <QrCode className="w-20 h-20 text-slate-950" />
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        Scan to Pay ₹{cartSummary.grandTotal}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Open any UPI app (GPay, PhonePe, Paytm, CRED) & scan to complete instant payment.
                  </p>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <p className="text-xs text-slate-300">
                    A secure intent link will trigger your <strong>{upiApp}</strong> application.
                  </p>
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-mono">
                    VPA: restomaster.pos@icici
                  </span>
                </div>
              )}
            </div>
          )}

          {selectedMethod === 'CARD' && (
            <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Card Number</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedMethod === 'CASH' || selectedMethod === 'COUNTER') && (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
              <Banknote className="w-12 h-12 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                {selectedMethod === 'COUNTER' ? 'Pay at Restaurant Counter' : 'Cash On Delivery'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {selectedMethod === 'COUNTER'
                  ? 'Your order will be sent to the kitchen immediately. You can settle the bill in cash or card at the cashier station.'
                  : 'Pay cash directly to our delivery courier upon receiving your hot meal.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Payment Action */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 shrink-0">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authorizing Payment of ₹{cartSummary.grandTotal}...</span>
              </>
            ) : isDone ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                <span>Payment Verified!</span>
              </>
            ) : (
              <span>Pay & Confirm Order (₹{cartSummary.grandTotal})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
