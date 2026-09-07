import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus, cancelOrder } from '@/api/order';
import { Order, OrderStatus } from '@/types/order';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import {
  Clock,
  Grid,
  Utensils,
  CheckCircle2,
  ChefHat,
  Bell,
  AlertTriangle,
  FileText,
  PlusCircle,
} from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onOrderUpdated: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onOrderUpdated,
}) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelPrompt, setCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && isOpen) {
      loadOrder();
      setCancelPrompt(false);
      setCancelReason('');
      setError(null);
    }
  }, [orderId, isOpen]);

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !orderId) return null;

  const handleStatusTransition = async (nextStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      setError(null);
      await updateOrderStatus(orderId, { status: nextStatus, reason: 'Staff updated status' });
      await loadOrder();
      onOrderUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await cancelOrder(orderId, cancelReason || 'Order cancelled by user');
      await loadOrder();
      onOrderUpdated();
      setCancelPrompt(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ACCEPTED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'PREPARING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'READY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'SERVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Order ${order.orderNumber}` : 'Order Details'}
      size="lg"
    >
      {isLoading || !order ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading order details...</div>
      ) : (
        <div className="space-y-5">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Order Status</span>
              <div>
                <span
                  className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Order Type</span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span>{order.orderType.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Table / Guest</span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <Grid className="w-3.5 h-3.5 text-amber-400" />
                <span>{order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || 'Walk-in'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Time Placed</span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Items Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Order Items ({order.itemCount || order.items.reduce((s, i) => s + i.quantity, 0)} pcs)
              </h4>
              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(order.tableId ? `/pos?tableId=${order.tableId}` : '/pos');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add More Items</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-800 max-h-[35vh] overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-white truncate">{item.itemName}</span>
                    </div>

                    {/* Modifiers */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.modifiers.map((m) => (
                          <span
                            key={m.id}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/60"
                          >
                            +{m.modifierName} (${Number(m.price).toFixed(2)})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Item Notes */}
                    {item.notes && (
                      <p className="text-[10px] text-amber-300/90 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      ${Number(item.subtotal).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${Number(item.unitPrice).toFixed(2)} ea
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financials & Order Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Notes / Special Instructions */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Remarks & History
              </span>
              <p className="text-xs text-slate-300 italic">
                {order.notes || 'No special remarks recorded.'}
              </p>
              {order.createdByName && (
                <p className="text-[10px] text-slate-500 pt-1">
                  Server / Cashier: {order.createdByName}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes:</span>
                <span className="font-semibold text-slate-200">${Number(order.taxAmount).toFixed(2)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount:</span>
                  <span>-${Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-black text-sm pt-1.5 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-emerald-400">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cancel Reason Box (if toggled) */}
          {cancelPrompt && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <span className="text-xs font-bold text-rose-400">Reason for cancellation:</span>
              <input
                type="text"
                placeholder="e.g. Guest changed mind, kitchen out of items..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-800 border border-rose-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={() => setCancelPrompt(false)}>
                  Back
                </Button>
                <Button variant="danger" size="sm" onClick={handleCancelOrder} disabled={isUpdating}>
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          )}

          {/* Action Lifecycle Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelPrompt(true)}
                disabled={isUpdating || cancelPrompt}
              >
                Cancel Order
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {order.status === 'NEW' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusTransition('ACCEPTED')}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept Order
                </Button>
              )}

              {order.status === 'ACCEPTED' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusTransition('PREPARING')}
                  disabled={isUpdating}
                >
                  <ChefHat className="w-4 h-4 mr-1.5" /> Start Cooking
                </Button>
              )}

              {order.status === 'PREPARING' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusTransition('READY')}
                  disabled={isUpdating}
                >
                  <Bell className="w-4 h-4 mr-1.5" /> Mark Ready for Serving
                </Button>
              )}

              {order.status === 'READY' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusTransition('SERVED')}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as Served
                </Button>
              )}

              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
