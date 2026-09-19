import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check, Clock, Percent } from 'lucide-react';
import { SAMPLE_COUPONS } from '@/services/customerMenuData';
import { useCustomerCartContext } from '@/context/CustomerCartContext';

export const CustomerOffersPage: React.FC = () => {
  const { applyCouponCode, setIsCartOpen } = useCustomerCartContext();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyToCart = (code: string) => {
    applyCouponCode(code);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Exclusive Dining Privileges
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          Offers, Discounts & Promo Codes
        </h1>
        <p className="text-xs text-slate-400">
          Apply promotional codes during checkout to enjoy exquisite culinary savings on your meals.
        </p>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_COUPONS.map((coupon) => (
          <div
            key={coupon.code}
            className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            {/* Background luxury watermark */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Code Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-sm font-black text-amber-300">
                    {coupon.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(coupon.code)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                  title="Copy code"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-serif text-lg font-bold text-white leading-snug">
                {coupon.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{coupon.description}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  Min. Order: ₹{coupon.minOrderAmount}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Valid till {coupon.validUntil}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500">
                T&C: Applicable on all dine-in & delivery orders
              </span>

              <button
                type="button"
                onClick={() => handleApplyToCart(coupon.code)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all shrink-0"
              >
                Apply to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerOffersPage;
