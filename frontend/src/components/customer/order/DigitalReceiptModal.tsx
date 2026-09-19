import React from 'react';
import { X, Printer, Share2, UtensilsCrossed, CheckCircle, ShieldCheck } from 'lucide-react';
import { CustomerOrder } from '@/types/customer';

interface DigitalReceiptModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `RestoMaster Receipt #${order.orderNumber}`,
        text: `Here is my dining receipt for Order #${order.orderNumber} at ${order.outletName}. Total: ₹${order.grandTotal}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `RestoMaster Receipt #${order.orderNumber}\nOutlet: ${order.outletName}\nAmount: ₹${order.grandTotal}\nPaid via: ${order.paymentMethod}`
      );
      alert('Receipt summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Official E-Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title="Share Receipt"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-6 sm:p-8 overflow-y-auto font-mono text-xs space-y-4">
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <h2 className="font-serif text-lg font-extrabold text-slate-950">RESTOMASTER</h2>
            <p className="text-[10px] text-slate-600">{order.outletName}</p>
            <p className="text-[10px] text-slate-500">{order.outletAddress}</p>
            <p className="text-[10px] text-slate-500">Ph: {order.outletPhone}</p>
            <p className="text-[10px] text-slate-500">GSTIN: 33AAACR4900Q1Z8</p>
          </div>

          {/* Metadata */}
          <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Ref:</span>
              <span className="font-bold">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Type:</span>
              <span className="font-bold">{order.orderType}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Table Number:</span>
                <span className="font-bold text-amber-600">Table {order.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                PAID ({order.paymentMethod})
              </span>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-slate-700 text-[11px]">
              <span>Item & Description</span>
              <span>Total</span>
            </div>
            {order.items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-[11px] text-slate-800">
                <div className="max-w-[200px]">
                  <span className="font-semibold">
                    {item.quantity}x {item.foodItem.name}
                  </span>
                  {item.customization.selectedVariant && (
                    <span className="block text-[10px] text-slate-500">
                      Portion: {item.customization.selectedVariant.name}
                    </span>
                  )}
                  {item.customization.selectedModifiers?.length > 0 && (
                    <span className="block text-[9px] text-slate-500">
                      +{item.customization.selectedModifiers.map((m) => m.optionName).join(', ')}
                    </span>
                  )}
                </div>
                <span className="font-semibold">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 text-[11px] pb-3 border-b border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>- ₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">CGST (2.5%) + SGST (2.5%):</span>
              <span>₹{order.taxAmount}</span>
            </div>
            {order.serviceChargeAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Dine-In Service Charge:</span>
                <span>₹{order.serviceChargeAmount}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Packaging / Delivery:</span>
                <span>₹{order.deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-950 border-t border-dashed border-slate-300 pt-2">
              <span>NET PAYABLE:</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </div>

          {/* Footer Thank You Note */}
          <div className="text-center pt-2 text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Thank you for dining with us!</p>
            <p>Please retain this digital copy for tax and audit purposes.</p>
            <div className="pt-2 flex items-center justify-center gap-1 text-[9px] text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Tax Invoice • FSSAI Approved</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Print CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
