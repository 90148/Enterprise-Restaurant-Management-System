import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Sparkles, ReceiptText, ArrowRight } from 'lucide-react';
import { CustomerOrder } from '@/types/customer';

interface OrderConfirmationModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
  onTrackOrder: (order: CustomerOrder) => void;
  onViewReceipt: (order: CustomerOrder) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  onViewReceipt,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6"
      >
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <CheckCircle className="w-10 h-10 text-slate-950 stroke-[2.5]" />
          </motion.div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Confirmation Titles */}
        <div className="space-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-xs text-slate-400">
            Your ticket has been sent to our kitchen display station.
          </p>
          <div className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono font-bold text-amber-400 mt-2">
            Order #{order.orderNumber}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Est. Preparation Time:
            </span>
            <span className="font-bold text-white">20–25 mins</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Outlet:
            </span>
            <span className="font-semibold text-white truncate max-w-[180px]">{order.outletName}</span>
          </div>

          {order.tableNumber && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Dine-In Table:</span>
              <span className="font-bold text-amber-400">Table {order.tableNumber}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Total Paid:</span>
            <span className="text-base font-black text-white">₹{order.grandTotal}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => onTrackOrder(order)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Live Order Tracking</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onViewReceipt(order)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ReceiptText className="w-3.5 h-3.5 text-amber-400" />
              <span>View Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
