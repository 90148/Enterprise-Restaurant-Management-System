import React from 'react';
import { KotTicket } from '@/types/kot';
import { Button } from '@/components/common/Button';
import { Printer, X } from 'lucide-react';

interface KotPrintModalProps {
  ticket: KotTicket | null;
  onClose: () => void;
}

export const KotPrintModal: React.FC<KotPrintModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.createdAt).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden during print) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Printer className="w-5 h-5 text-emerald-600" />
            <span>Thermal KOT Slip (80mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={handlePrint}>
              Print Slip
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div id="kot-print-area" className="p-6 bg-white font-mono text-xs text-black space-y-4">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-black pb-3">
            <h2 className="text-base font-bold tracking-wider uppercase">KITCHEN ORDER TICKET</h2>
            <p className="text-sm font-black mt-1">{ticket.station || 'MAIN KITCHEN'}</p>
            <div className="mt-2 text-xs flex justify-between">
              <span>{ticket.kotNumber}</span>
              <span>Round #{ticket.roundNumber}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-xs border-b border-dashed border-black pb-3">
            <div className="flex justify-between">
              <span className="font-bold">Order #:</span>
              <span>{ticket.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Type:</span>
              <span className="font-black">{ticket.orderType}</span>
            </div>
            {ticket.tableNumber && (
              <div className="flex justify-between text-sm font-black">
                <span>Table:</span>
                <span>{ticket.tableNumber} {ticket.floorName ? `(${ticket.floorName})` : ''}</span>
              </div>
            )}
            {ticket.customerName && (
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{ticket.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Server:</span>
              <span>{ticket.serverName || 'Staff'}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Notes Callout */}
          {ticket.notes && (
            <div className="border border-black p-2 text-xs font-bold bg-slate-50">
              <span className="underline">ORDER NOTE:</span> {ticket.notes}
            </div>
          )}

          {/* Items */}
          <div className="space-y-3 border-b-2 border-dashed border-black pb-3">
            <div className="flex justify-between font-bold border-b border-black pb-1">
              <span>QTY ITEM</span>
              <span>STATION</span>
            </div>
            {ticket.items.map((item, idx) => (
              <div key={item.id || idx} className="space-y-0.5">
                <div className="flex justify-between items-start font-black text-sm">
                  <span>
                    {item.quantity}x {item.itemName}
                  </span>
                  <span className="text-[10px] font-normal uppercase text-slate-600">
                    {item.kitchenStation || 'KITCHEN'}
                  </span>
                </div>
                {item.modifiersSummary && (
                  <div className="pl-4 text-[11px] italic font-semibold text-slate-700">
                    + {item.modifiersSummary}
                  </div>
                )}
                {item.notes && (
                  <div className="pl-4 text-[11px] font-bold text-red-600">
                    * NOTE: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center pt-2 space-y-1">
            <p className="text-[11px]">Total Items: {ticket.items.reduce((acc, curr) => acc + curr.quantity, 0)}</p>
            <p className="text-[10px] text-slate-500 font-sans">RestoMaster POS & KDS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
