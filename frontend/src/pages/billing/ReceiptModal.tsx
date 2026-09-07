import React from 'react';
import { Bill } from '@/types/billing';
import { Button } from '@/components/common/Button';
import { Printer, X, Receipt } from 'lucide-react';

interface ReceiptModalProps {
  bill: Bill | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ bill, onClose }) => {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(bill.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>Customer Tax Invoice / Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" />
              Print Receipt
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable 80mm Thermal Receipt Canvas */}
        <div id="thermal-receipt-area" className="p-6 bg-white font-mono text-xs text-black space-y-4">
          {/* Restaurant Header */}
          <div className="text-center border-b-2 border-dashed border-black pb-3 space-y-0.5">
            <h1 className="text-base font-black tracking-wider uppercase">{bill.outletName || 'RESTOMASTER RESTAURANT'}</h1>
            <p className="text-[11px] text-slate-700">123 Gourmet Blvd, Food District</p>
            <p className="text-[11px] text-slate-700">Tel: +1-555-0199 • Tax ID: TAX-US-892110</p>
            <div className="pt-2 text-xs font-bold uppercase tracking-wide">
              {bill.status === 'PAID' ? '*** TAX INVOICE - PAID ***' : '*** GUEST BILL - UNPAID ***'}
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="space-y-1 text-xs border-b border-dashed border-black pb-3">
            <div className="flex justify-between">
              <span className="font-bold">Bill No:</span>
              <span className="font-mono font-bold">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Order No:</span>
              <span className="font-mono">{bill.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{formattedDate}</span>
            </div>
            {bill.tableNumber && (
              <div className="flex justify-between font-black text-sm">
                <span>Table:</span>
                <span>{bill.tableNumber} {bill.floorName ? `(${bill.floorName})` : ''}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-bold">{bill.orderType}</span>
            </div>
            {bill.customerName && (
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{bill.customerName}</span>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-2 border-b-2 border-dashed border-black pb-3">
            <div className="flex justify-between font-bold border-b border-black pb-1">
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            {bill.items.map((item, idx) => (
              <div key={item.id || idx} className="space-y-0.5">
                <div className="flex justify-between items-start font-medium">
                  <span>
                    {item.quantity}x {item.itemName}
                  </span>
                  <span className="font-bold">${Number(item.subtotal).toFixed(2)}</span>
                </div>
                {item.modifiersSummary && (
                  <p className="text-[10px] text-slate-600 italic pl-3">
                    + {item.modifiersSummary}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 border-b-2 border-dashed border-black pb-3 font-semibold">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${Number(bill.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST / VAT):</span>
              <span>${Number(bill.taxAmount).toFixed(2)}</span>
            </div>
            {Number(bill.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-${Number(bill.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
              <span>TOTAL DUE:</span>
              <span>${Number(bill.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Payments & Tenders */}
          {bill.payments && bill.payments.length > 0 && (
            <div className="space-y-1.5 border-b border-dashed border-black pb-3">
              <p className="font-bold text-xs uppercase">Payment Details:</p>
              {bill.payments.map((p, idx) => (
                <div key={p.id || idx} className="text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span>
                      {p.paymentMethod} {p.transactionRef ? `(${p.transactionRef})` : ''}:
                    </span>
                    <span className="font-bold">${Number(p.amount).toFixed(2)}</span>
                  </div>
                  {p.paymentMethod === 'CASH' && Number(p.tenderedAmount) > 0 && (
                    <div className="flex justify-between text-[11px] text-slate-600 pl-2">
                      <span>Cash Tendered: ${Number(p.tenderedAmount).toFixed(2)}</span>
                      <span>Change: ${Number(p.changeAmount || 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between text-xs font-bold pt-1">
                <span>Total Paid:</span>
                <span>${Number(bill.paidAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-black">
                <span>Balance:</span>
                <span>${Number(bill.balanceAmount).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Footer Barcode / Thank You */}
          <div className="text-center pt-2 space-y-1 text-[11px]">
            <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
            <p className="text-slate-600">Please visit again soon.</p>
            <p className="text-[10px] text-slate-400 font-sans mt-2">Powered by RestoMaster POS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
