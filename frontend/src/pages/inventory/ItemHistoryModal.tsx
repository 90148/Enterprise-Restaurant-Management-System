import React, { useEffect, useState } from 'react';
import { InventoryItem, InventoryTransaction } from '@/types/inventory';
import { getItemTransactions } from '@/api/inventory';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

interface ItemHistoryModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemHistoryModal: React.FC<ItemHistoryModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && item) {
      loadHistory();
    }
  }, [isOpen, item]);

  const loadHistory = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const data = await getItemTransactions(item.id);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load item history', err);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit Trail: ${item.name}`}
      description={`SKU: ${item.sku} • Current Stock: ${Number(item.currentStock).toFixed(3)} ${item.unitSymbol}`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b">
          <span>Displaying recent movements</span>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading audit records...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No stock movements recorded yet for this item.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {transactions.map((tx) => {
              const qty = Number(tx.quantityChanged);
              const isPositive = qty > 0;
              const formattedDate = formatDateTime(tx.createdAt);

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-xs tracking-wide">
                          {tx.transactionType}
                        </span>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500">{formattedDate}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{tx.notes || 'Stock adjustment'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">By: {tx.createdByName || 'System'}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${qty.toFixed(3)}` : qty.toFixed(3)} {tx.unitSymbol}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Rem: {Number(tx.remainingStock).toFixed(3)} {tx.unitSymbol}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
