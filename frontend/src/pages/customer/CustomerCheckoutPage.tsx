import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Utensils,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { PaymentGatewayModal } from '@/components/customer/checkout/PaymentGatewayModal';
import { OrderConfirmationModal } from '@/components/customer/order/OrderConfirmationModal';
import { OrderTrackingModal } from '@/components/customer/order/OrderTrackingModal';
import { DigitalReceiptModal } from '@/components/customer/order/DigitalReceiptModal';
import { CustomerOrder, OrderType } from '@/types/customer';

export const CustomerCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartSummary,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    couponMessage,
  } = useCustomerCartContext();

  const {
    customer,
    updateProfile,
    addAddress,
    activeOutlet,
    activeTable,
    setActiveTable,
    orderType,
    setOrderType,
    setIsOutletModalOpen,
  } = useCustomerContext();

  // Selected address for delivery
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.addresses[0]?.id || ''
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newApt, setNewApt] = useState('');
  const [newPincode, setNewPincode] = useState('600020');

  // Contact details
  const [customerName, setCustomerName] = useState(customer.name);
  const [customerPhone, setCustomerPhone] = useState(customer.phone);
  const [customerEmail, setCustomerEmail] = useState(customer.email);

  // Instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<CustomerOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<CustomerOrder | null>(null);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;
    addAddress({
      label: 'Other',
      street: newStreet.trim(),
      apartment: newApt.trim() || undefined,
      city: activeOutlet?.city || 'Chennai',
      pincode: newPincode.trim() || '600020',
      isDefault: false,
    });
    setShowNewAddressForm(false);
    setNewStreet('');
    setNewApt('');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      navigate('/customer/menu');
      return;
    }
    // Update profile with latest contact info
    updateProfile({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (order: CustomerOrder) => {
    setIsPaymentModalOpen(false);
    setConfirmedOrder(order);
  };

  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">Your Cart is Currently Empty</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Add some of our chef signature dum biryanis, kebabs, or artisanal wood-fired pizzas to continue.
        </p>
        <Link
          to="/customer/menu"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          <span>Explore Digital Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>
        <span className="text-xs text-amber-400 font-medium">Step 1 of 2: Checkout Details</span>
      </div>

      <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
        Complete Your Order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Order Details & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Order Mode & Destination */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1. Select Dining Mode</h3>
                  <p className="text-[11px] text-slate-400">Where will you be enjoying this feast?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutletModalOpen(true)}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Change Outlet
              </button>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'DINE_IN', label: 'Dine-In', icon: Utensils, desc: 'At our restaurant table' },
                { type: 'TAKEAWAY', label: 'Takeaway', icon: ShoppingBag, desc: 'Self-pickup at counter' },
                { type: 'DELIVERY', label: 'Delivery', icon: Truck, desc: 'Hot delivery to doorstep' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = orderType === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setOrderType(m.type as OrderType)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'} mb-2`} />
                    <h4 className="text-xs font-bold">{m.label}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Conditional Sub-settings for Mode */}
            {orderType === 'DINE_IN' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Assigned Dine-In Table</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Ask captain or scan QR)</span>
                  </label>
                  <span className="text-xs font-semibold text-emerald-400">● Outlet Tables Available</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {['T-01', 'T-02', 'T-04', 'T-08', 'T-12', 'T-15'].map((tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setActiveTable(tbl)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        activeTable === tbl
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderType === 'DELIVERY' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Delivery Address</h4>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm((prev) => !prev)}
                    className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* Saved addresses list */}
                <div className="space-y-2">
                  {customer.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 bg-slate-800 text-amber-400 text-[9px] font-bold rounded uppercase">
                              {addr.label}
                            </span>
                            <span className="text-xs font-bold">{addr.street}</span>
                          </div>
                          {addr.apartment && (
                            <p className="text-[11px] text-slate-400">{addr.apartment}</p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            {addr.city} - {addr.pincode}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 mt-1" />}
                      </div>
                    );
                  })}
                </div>

                {/* New Address Form */}
                {showNewAddressForm && (
                  <form onSubmit={handleAddNewAddress} className="pt-3 border-t border-slate-800 space-y-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Street address & area..."
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Flat / Floor / Landmark (optional)..."
                      value={newApt}
                      onChange={(e) => setNewApt(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode (e.g. 600020)..."
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Guest Information */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">2. Guest Contact & Notification</h3>
                <p className="text-[11px] text-slate-400">Receive live kitchen updates and receipt</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Receipt</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Special Delivery / Kitchen Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Ring doorbell, bring extra mint chutney, serve hot..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Order Summary & Payment Button */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl sticky top-24">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-slate-400">
                {cartSummary.itemCount} items
              </span>
            </h3>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-start text-xs">
                  <div className="space-y-0.5 max-w-[180px]">
                    <span className="font-semibold text-slate-200">
                      {item.quantity}x {item.foodItem.name}
                    </span>
                    {item.customization.selectedVariant && (
                      <span className="text-[10px] text-amber-400 block">
                        Size: {item.customization.selectedVariant.name}
                      </span>
                    )}
                    {item.customization.selectedModifiers?.length > 0 && (
                      <span className="text-[9px] text-slate-400 block">
                        +{item.customization.selectedModifiers.map((m) => m.optionName).join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-white">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-3 border-t border-slate-800">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  <span className="font-bold">Code {appliedCoupon.code} applied!</span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Coupon (FEAST20)"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => applyCouponCode(couponCodeInput)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponMessage && !appliedCoupon && (
                <p className="text-[10px] text-rose-400 mt-1">{couponMessage}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span>₹{cartSummary.subtotal}</span>
              </div>
              {cartSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>- ₹{cartSummary.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">GST (5%)</span>
                <span>₹{cartSummary.taxAmount}</span>
              </div>
              {cartSummary.serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Charge (5%)</span>
                  <span>₹{cartSummary.serviceChargeAmount}</span>
                </div>
              )}
              {cartSummary.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Packaging / Delivery</span>
                  <span>₹{cartSummary.deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-800 pt-3">
                <span>Net Payable</span>
                <span className="text-amber-400">₹{cartSummary.grandTotal}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-between px-5 active:scale-98"
            >
              <span>Proceed to Payment</span>
              <div className="flex items-center gap-1.5">
                <span>₹{cartSummary.grandTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        specialInstructions={specialInstructions}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => {
          setConfirmedOrder(null);
          navigate('/customer/orders');
        }}
        onTrackOrder={(order) => {
          setConfirmedOrder(null);
          setTrackingOrder(order);
        }}
        onViewReceipt={(order) => {
          setConfirmedOrder(null);
          setReceiptOrder(order);
        }}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onViewReceipt={(order) => setReceiptOrder(order)}
      />

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
};

export default CustomerCheckoutPage;
