import React, { useState } from 'react';
import { X, Split, ArrowRight } from 'lucide-react';
import { CustomerOrder } from '@/types/customer';

interface SplitBillModalProps {
  order: CustomerOrder;
  onClose: () => void;
  onProceedPayment: (personShares: { name: string; amount: number }[]) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  order,
  onClose,
  onProceedPayment,
}) => {
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [guestCount, setGuestCount] = useState(2);

  // Equal split
  const perPersonAmount = Math.ceil(order.grandTotal / guestCount);

  // Custom 2-person split example
  const [person1Amount, setPerson1Amount] = useState(Math.round(order.grandTotal * 0.5));
  const person2Amount = Math.max(0, order.grandTotal - person1Amount);

  const handleProceed = () => {
    if (splitMode === 'EQUAL') {
      const shares = Array.from({ length: guestCount }).map((_, i) => ({
        name: `Guest ${i + 1}`,
        amount: perPersonAmount,
      }));
      onProceedPayment(shares);
    } else {
      onProceedPayment([
        { name: 'Person 1', amount: person1Amount },
        { name: 'Person 2', amount: person2Amount },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Split Dining Bill</h3>
              <p className="text-[11px] text-slate-400">
                Order #{order.orderNumber} • Total: ₹{order.grandTotal}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Split Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSplitMode('EQUAL')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                splitMode === 'EQUAL'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split Equally
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('CUSTOM')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                splitMode === 'CUSTOM'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom Split
            </button>
          </div>

          {splitMode === 'EQUAL' ? (
            <div className="space-y-4 text-center">
              <span className="text-xs text-slate-400 font-medium">How many guests are sharing?</span>
              <div className="flex justify-center items-center gap-3">
                {[2, 3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setGuestCount(count)}
                    className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all ${
                      guestCount === count
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium">Each Guest Pays</span>
                <div className="text-3xl font-black text-amber-400">₹{perPersonAmount}</div>
                <p className="text-[11px] text-slate-500 pt-1">
                  (₹{order.grandTotal} split equally across {guestCount} diners)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-white">Person 1 Share</h5>
                    <span className="text-[10px] text-slate-400">Adjust amount</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={person1Amount}
                      onChange={(e) =>
                        setPerson1Amount(
                          Math.max(0, Math.min(order.grandTotal, Number(e.target.value)))
                        )
                      }
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white text-right outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-white">Person 2 Share</h5>
                    <span className="text-[10px] text-slate-400">Remaining balance</span>
                  </div>
                  <span className="text-base font-black text-amber-400">₹{person2Amount}</span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>Total Bill Check:</span>
                <span className="font-bold text-white">₹{person1Amount + person2Amount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed with Split Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
