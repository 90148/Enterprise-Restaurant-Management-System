import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCustomerCartContext } from '@/context/CustomerCartContext';

export const MiniCart: React.FC = () => {
  const { cartSummary, isCartOpen, setIsCartOpen } = useCustomerCartContext();

  if (cartSummary.itemCount === 0 || isCartOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-40"
      >
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-2xl shadow-2xl shadow-amber-500/30 border border-amber-400/50 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
              {cartSummary.itemCount}
            </span>
          </div>

          <div className="text-left leading-tight">
            <span className="text-xs font-black block">
              {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'Item' : 'Items'}
            </span>
            <span className="text-[11px] font-medium text-slate-900">
              ₹{cartSummary.grandTotal} Total
            </span>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-950/20 text-xs font-black">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
