import React, { useState } from 'react';
import { PurchaseOrder } from '@/types/inventory';
import { receivePurchaseOrder } from '@/api/inventory';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CheckCircle2, AlertCircle, Clock, Truck, User } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

interface PurchaseOrderDetailModalProps {
  po: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PurchaseOrderDetailModal: React.FC<PurchaseOrderDetailModalProps> = ({
  po,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!po) return null;

  const handleReceive = async () => {
    if (!window.confirm(`Are you sure you want to receive PO ${po.poNumber}? This will increment physical inventory and recalculate weighted average costs.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await receivePurchaseOrder(po.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to receive purchase order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Received & Restocked
          </span>
        );
      case 'ORDERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            Pending Delivery
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const orderDate = formatDateTime(po.createdAt);
  const receivedDate = formatDateTime(po.receivedAt);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Order: ${po.poNumber}`}
      description={`Supplier: ${po.supplierName} • Ordered on ${orderDate}`}
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PO Metadata Summary */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Current Status</span>
            <div className="mt-1">{getStatusBadge(po.status)}</div>
          </div>
          <div>
            <span className="text-slate-500 block">Supplier Contact</span>
            <span className="font-semibold text-slate-800 mt-1 block">
              {po.supplierContact || 'None provided'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Ordered By</span>
            <span className="font-semibold text-slate-800 mt-1 block flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {po.createdByName || 'System'}
            </span>
          </div>
          {po.receivedAt && (
            <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
              <span className="text-slate-500">Restocked At:</span>{' '}
              <span className="font-semibold text-emerald-700 font-mono">{receivedDate}</span>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Procured Line Items ({po.items?.length || 0})
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Item / SKU</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {po.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.inventoryItemName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                      {Number(item.quantity).toFixed(3)} {item.unitSymbol}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ${Number(item.unitCost).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-right">
                    Total Amount:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-800">
                    ${Number(po.totalAmount).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {po.notes && (
          <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-600">
            <span className="font-semibold text-slate-700">Notes:</span> {po.notes}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>

          {po.status === 'ORDERED' && (
            <Button
              variant="primary"
              onClick={handleReceive}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              {loading ? 'Receiving...' : 'Receive & Update Stock'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
