import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import type { RestaurantTable, TableStatus } from '@/types/table';
import { CheckCircle2, Utensils, Calendar, Receipt } from 'lucide-react';
import { clsx } from 'clsx';

interface TableStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
  onUpdateStatus: (status: TableStatus) => Promise<void>;
  isLoading?: boolean;
}

export const TableStatusModal: React.FC<TableStatusModalProps> = ({
  isOpen,
  onClose,
  table,
  onUpdateStatus,
  isLoading = false,
}) => {
  if (!table) return null;

  const statuses: {
    key: TableStatus;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgHover: string;
    borderColor: string;
  }[] = [
    {
      key: 'AVAILABLE',
      title: 'Available',
      description: 'Clean, sanitized, and open for guest seating or walk-ins.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: 'text-emerald-400',
      bgHover: 'hover:bg-emerald-950/40 hover:border-emerald-500',
      borderColor: 'border-emerald-500/40',
    },
    {
      key: 'OCCUPIED',
      title: 'Occupied',
      description: 'Dining in progress with active party or open order ticket.',
      icon: <Utensils className="w-5 h-5 text-rose-400" />,
      color: 'text-rose-400',
      bgHover: 'hover:bg-rose-950/40 hover:border-rose-500',
      borderColor: 'border-rose-500/40',
    },
    {
      key: 'RESERVED',
      title: 'Reserved',
      description: 'Hold table for an incoming customer reservation.',
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      color: 'text-blue-400',
      bgHover: 'hover:bg-blue-950/40 hover:border-blue-500',
      borderColor: 'border-blue-500/40',
    },
    {
      key: 'BILLING',
      title: 'Billing / Settlement',
      description: 'Check printed or requested; waiting for payment completion.',
      icon: <Receipt className="w-5 h-5 text-amber-400" />,
      color: 'text-amber-400',
      bgHover: 'hover:bg-amber-950/40 hover:border-amber-500',
      borderColor: 'border-amber-500/40',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status: Table ${table.tableNumber}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700">
          <div>
            <p className="text-xs text-slate-400 font-medium">Current Status</p>
            <p className="text-sm font-bold text-white tracking-wide">{table.tableNumber} • {table.capacity} Guests</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-700 text-slate-200 uppercase tracking-wider">
            {table.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {statuses.map((s) => {
            const isCurrent = table.status === s.key;
            return (
              <button
                key={s.key}
                type="button"
                disabled={isLoading || isCurrent}
                onClick={() => onUpdateStatus(s.key)}
                className={clsx(
                  'w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5',
                  isCurrent
                    ? 'bg-slate-800/90 border-slate-600 ring-2 ring-slate-500 cursor-default opacity-80'
                    : `bg-slate-900/60 ${s.borderColor} ${s.bgHover} cursor-pointer`
                )}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-slate-800/90 border border-slate-700/60">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={clsx('text-sm font-bold', s.color)}>{s.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TableStatusModal;
