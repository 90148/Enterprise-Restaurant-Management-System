import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ReceiptText,
  Clock,
  MapPin,
  CheckCircle2,
  ChefHat,
  RotateCcw,
  Star,
  Split,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { OrderTrackingModal } from '@/components/customer/order/OrderTrackingModal';
import { DigitalReceiptModal } from '@/components/customer/order/DigitalReceiptModal';
import { FeedbackModal } from '@/components/customer/feedback/FeedbackModal';
import { SplitBillModal } from '@/components/customer/dinein/SplitBillModal';
import { CustomerOrder } from '@/types/customer';

export const CustomerOrdersPage: React.FC = () => {
  const {
    orders,
    activeOrders,
    completedOrders,
    reorder,
    rateOrder,
    activeTrackingOrder,
    setActiveTrackingOrder,
    selectedReceiptOrder,
    setSelectedReceiptOrder,
    feedbackOrder,
    setFeedbackOrder,
  } = useCustomerOrders();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [splitOrder, setSplitOrder] = useState<CustomerOrder | null>(null);

  const displayedOrders =
    activeTab === 'ACTIVE'
      ? activeOrders
      : activeTab === 'COMPLETED'
      ? completedOrders
      : orders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1.5 animate-pulse">
            <ChefHat className="w-3.5 h-3.5" />
            Preparing in Kitchen
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Ready for Pickup / Serving
          </span>
        );
      case 'SERVED':
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered & Served
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-slate-800 text-slate-300 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            My Culinary Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active tickets, view historical receipts, reorder favorites, and rate your dishes.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { key: 'ALL', label: `All (${orders.length})` },
            { key: 'ACTIVE', label: `Active (${activeOrders.length})` },
            { key: 'COMPLETED', label: `Past (${completedOrders.length})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === t.key
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="text-center py-20 px-4 bg-slate-900/60 rounded-3xl border border-slate-800 max-w-md mx-auto">
          <ReceiptText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Orders in this Section</h3>
          <p className="text-xs text-slate-400 mb-6">
            Ready to experience unforgettable culinary masterpieces?
          </p>
          <Link
            to="/customer/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors"
          >
            <span>Browse Restaurant Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition-all"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Order #{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-500">• {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{order.outletName}</span>
                      {order.tableNumber && (
                        <strong className="text-amber-400 ml-1">(Table {order.tableNumber})</strong>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-base font-extrabold text-white">₹{order.grandTotal}</span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex justify-between items-center text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">{item.quantity}x</span>
                      <span>{item.foodItem.name}</span>
                      {item.customization.selectedVariant && (
                        <span className="text-[10px] text-slate-400">
                          ({item.customization.selectedVariant.name})
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-200">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Live Tracking */}
                  <button
                    type="button"
                    onClick={() => setActiveTrackingOrder(order)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Live Tracking</span>
                  </button>

                  {/* Digital Receipt */}
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptOrder(order)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ReceiptText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Receipt</span>
                  </button>

                  {/* Split Bill (For Dine-In) */}
                  {order.orderType === 'DINE_IN' && (
                    <button
                      type="button"
                      onClick={() => setSplitOrder(order)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Split className="w-3.5 h-3.5 text-purple-400" />
                      <span>Split Bill</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder Button */}
                  <button
                    type="button"
                    onClick={() => reorder(order)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Re-add items to cart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>

                  {/* Rate Order Button */}
                  <button
                    type="button"
                    disabled={order.isRated}
                    onClick={() => setFeedbackOrder(order)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      order.isRated
                        ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{order.isRated ? 'Rated' : 'Rate Experience'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        order={activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
        onViewReceipt={(order) => setSelectedReceiptOrder(order)}
      />

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

      {/* Split Bill Modal */}
      {splitOrder && (
        <SplitBillModal
          order={splitOrder}
          onClose={() => setSplitOrder(null)}
          onProceedPayment={(shares) => {
            alert(`Split payment initiated! ${shares.length} shares created. Total: ₹${splitOrder.grandTotal}`);
            setSplitOrder(null);
          }}
        />
      )}

      {/* Feedback Rating Modal */}
      <FeedbackModal
        order={feedbackOrder}
        onClose={() => setFeedbackOrder(null)}
        onSubmit={(review) => rateOrder(review)}
      />
    </div>
  );
};

export default CustomerOrdersPage;
