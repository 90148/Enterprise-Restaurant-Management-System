import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  ReceiptText,
  Phone,
  Sparkles,
} from 'lucide-react';
import { CustomerOrder } from '@/types/customer';
import { useCustomerContext } from '@/context/CustomerContext';

interface OrderTrackingModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
  onViewReceipt: (order: CustomerOrder) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onViewReceipt,
}) => {
  const { setIsCallWaiterModalOpen } = useCustomerContext();

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Live Order Tracking</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Order #{order.orderNumber}</p>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Estimated Preparation Hero Banner */}
          <div className="p-5 bg-gradient-to-r from-amber-500/15 via-slate-950 to-orange-500/15 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Estimated Serving Time
              </span>
              <div className="text-2xl font-black text-white">
                ~ {order.estimatedDeliveryTime}
              </div>
              <p className="text-[11px] text-slate-400">
                {order.orderType === 'DINE_IN'
                  ? `Kitchen chefs are preparing your meal for Table ${order.tableNumber || 'T-12'}`
                  : `Courier will deliver to ${order.deliveryAddress?.street || 'your doorstep'}`}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Real-time Visual Timeline Stepper */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Preparation Journey
            </h4>

            <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {order.trackingTimeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Step status dot */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                      step.isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : step.isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Step description */}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h5
                        className={`text-xs font-bold ${
                          step.isCurrent
                            ? 'text-amber-400'
                            : step.isCompleted
                            ? 'text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.title}
                      </h5>
                      {step.timestamp && (
                        <span className="text-[10px] text-slate-500">{step.timestamp}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Dishes Quick List */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Dishes in this Order ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {item.quantity}x
                    </span>
                    <div>
                      <span className="font-semibold text-white">{item.foodItem.name}</span>
                      {item.customization.selectedVariant && (
                        <span className="text-slate-400 text-[10px] block">
                          ({item.customization.selectedVariant.name})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-slate-200">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsCallWaiterModalOpen(true);
            }}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Call Table Waiter</span>
          </button>

          <button
            type="button"
            onClick={() => onViewReceipt(order)}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ReceiptText className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Receipt</span>
          </button>

          <a
            href={`tel:${order.outletPhone}`}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title="Call Restaurant"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
