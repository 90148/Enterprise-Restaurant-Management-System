import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Utensils,
  AlertCircle,
} from 'lucide-react';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerContext } from '@/context/CustomerContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    couponMessage,
    applyCouponCode,
    removeCoupon,
    cartSummary,
    isCartOpen,
    setIsCartOpen,
  } = useCustomerCartContext();

  const { orderType, setOrderType, activeTable, activeOutlet } = useCustomerContext();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput.trim());
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/customer/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Your Gourmet Cart</h3>
              <p className="text-[11px] text-slate-400">
                {cartSummary.itemCount} items from {activeOutlet?.name || 'RestoMaster'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 hover:bg-rose-500/10 rounded transition-colors"
                title="Empty cart"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Type Toggle (Dine-In, Takeaway, Delivery) */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/90 rounded-xl border border-slate-700">
            {[
              { type: 'DINE_IN', label: 'Dine-In' },
              { type: 'TAKEAWAY', label: 'Takeaway' },
              { type: 'DELIVERY', label: 'Delivery' },
            ].map((ot) => (
              <button
                key={ot.type}
                type="button"
                onClick={() => setOrderType(ot.type as any)}
                className={`py-1.5 text-xs rounded-lg font-bold transition-all text-center ${
                  orderType === ot.type
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ot.label}
              </button>
            ))}
          </div>
          {orderType === 'DINE_IN' && activeTable && (
            <div className="mt-2 text-[11px] text-amber-400 flex items-center justify-between px-1">
              <span>Seated at Table: <strong>{activeTable}</strong></span>
              <span className="text-slate-400">• Service charges applied</span>
            </div>
          )}
        </div>

        {/* Cart items list / Empty state */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                Explore our signature dum biryanis, charcoal starters, and wood-fired artisanal pizzas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/customer/menu');
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-start gap-3 relative group"
              >
                {/* Dish Photo */}
                <img
                  src={item.foodItem.imageUrl}
                  alt={item.foodItem.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
                />

                {/* Details & Customizations */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-tight truncate">
                      {item.foodItem.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Customization tags */}
                  <div className="text-[11px] text-amber-300 space-y-0.5">
                    {item.customization.selectedVariant && (
                      <span className="block font-medium">
                        Size: {item.customization.selectedVariant.name}
                      </span>
                    )}
                    {item.customization.selectedModifiers?.length > 0 && (
                      <span className="block text-slate-300">
                        + {item.customization.selectedModifiers.map((m) => m.optionName).join(', ')}
                      </span>
                    )}
                    {item.customization.specialInstructions && (
                      <span className="block text-slate-400 italic text-[10px]">
                        Note: "{item.customization.specialInstructions}"
                      </span>
                    )}
                  </div>

                  {/* Price & Quantity Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-extrabold text-white">
                      ₹{item.totalPrice}
                    </span>

                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon Section & Bill Breakdown (only if cart has items) */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-4 shrink-0">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-300">{appliedCoupon.code} applied</span>
                      <p className="text-[10px] text-emerald-400">
                        You saved ₹{cartSummary.discountAmount}!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. FEAST20)"
                      className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white uppercase placeholder-slate-400 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponMessage && !appliedCoupon && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Bill Summary Table */}
            <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Item Subtotal</span>
                <span>₹{cartSummary.subtotal}</span>
              </div>
              {cartSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>- ₹{cartSummary.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">GST Tax (5%)</span>
                <span>₹{cartSummary.taxAmount}</span>
              </div>
              {cartSummary.serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Dine-In Service Charge (5%)</span>
                  <span>₹{cartSummary.serviceChargeAmount}</span>
                </div>
              )}
              {cartSummary.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {orderType === 'DELIVERY' ? 'Doorstep Delivery Fee' : 'Packaging Charges'}
                  </span>
                  <span>₹{cartSummary.deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-800 pt-2">
                <span>Grand Total</span>
                <span className="text-amber-400">₹{cartSummary.grandTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-between px-5 active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-1.5">
                <span>₹{cartSummary.grandTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
