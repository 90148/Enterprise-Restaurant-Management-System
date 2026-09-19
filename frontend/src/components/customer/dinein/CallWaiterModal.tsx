import React, { useState } from 'react';
import { X, BellRing, Droplet, Receipt, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { submitServiceRequest } from '@/services/customerService';
import { useCustomerNotificationContext } from '@/context/CustomerNotificationContext';

export const CallWaiterModal: React.FC = () => {
  const { isCallWaiterModalOpen, setIsCallWaiterModalOpen, activeTable, activeOutlet } =
    useCustomerContext();
  const { addNotification } = useCustomerNotificationContext();

  const [selectedType, setSelectedType] = useState<'WAITER' | 'WATER' | 'BILL' | 'CLEAN'>('WAITER');
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isCallWaiterModalOpen) return null;

  const handleSendRequest = () => {
    setIsSending(true);
    setTimeout(() => {
      submitServiceRequest({
        id: `srv-${Date.now()}`,
        tableNumber: activeTable || 'T-12',
        outletId: activeOutlet?.id || 'out-001',
        requestType: selectedType,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
      });

      addNotification({
        title: 'Table Service Request Sent! 🔔',
        message: `Your request (${selectedType}) for Table ${activeTable || 'T-12'} has been routed to the floor captain.`,
        type: 'TABLE',
      });

      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setIsCallWaiterModalOpen(false);
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">In-Seat Table Service</h3>
              <p className="text-[11px] text-slate-400">
                Current Table: <strong className="text-amber-400 font-bold">{activeTable || 'T-12'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCallWaiterModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Selection */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { type: 'WAITER', label: 'Call Waiter', desc: 'Need ordering help or cutlery', icon: BellRing },
            { type: 'WATER', label: 'Fresh Water', desc: 'Request mineral/regular water', icon: Droplet },
            { type: 'BILL', label: 'Request Bill', desc: 'Ready to settle dining check', icon: Receipt },
            { type: 'CLEAN', label: 'Clean Table', desc: 'Clear plates or spills', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setSelectedType(item.type as any)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{item.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Note input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-300">
            Optional message for the captain:
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please bring extra napkins or ice..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={isSending}
          onClick={handleSendRequest}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Notifying Floor Captain...</span>
            </>
          ) : isSent ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Captain Notified for Table {activeTable || 'T-12'}!</span>
            </>
          ) : (
            <span>Send Request to Waiter</span>
          )}
        </button>
      </div>
    </div>
  );
};
