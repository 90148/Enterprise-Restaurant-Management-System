import React from 'react';
import Badge from './Badge';

export type StatusType =
  // Table Statuses
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'BILLING'
  // Order & KOT Statuses
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED'
  // Bill / Payment Statuses
  | 'DRAFT'
  | 'GENERATED'
  | 'PAID'
  | 'PARTIAL'
  | 'FAILED'
  | 'REFUNDED'
  // Inventory Statuses
  | 'NORMAL'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'EXPIRING'
  // General Statuses
  | 'ACTIVE'
  | 'INACTIVE'
  | 'APPROVED'
  | 'GOODS_RECEIVED';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let variant: 'slate' | 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' = 'slate';
  let label = status;

  switch (normalized) {
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'PAID':
    case 'ACTIVE':
    case 'NORMAL':
    case 'GOODS_RECEIVED':
      variant = 'emerald';
      break;

    case 'OCCUPIED':
    case 'CANCELLED':
    case 'FAILED':
    case 'OUT_OF_STOCK':
    case 'INACTIVE':
      variant = 'rose';
      break;

    case 'BILLING':
    case 'PREPARING':
    case 'PARTIAL':
    case 'LOW_STOCK':
    case 'EXPIRING':
    case 'DRAFT':
      variant = 'amber';
      break;

    case 'RESERVED':
    case 'ACCEPTED':
    case 'GENERATED':
    case 'APPROVED':
      variant = 'blue';
      break;

    case 'NEW':
    case 'READY':
    case 'SERVED':
    case 'REFUNDED':
      variant = 'purple';
      break;

    default:
      variant = 'slate';
  }

  // Format label: replaces underscores with space and capitalizes
  label = normalized.replace(/_/g, ' ');

  return (
    <Badge variant={variant} size={size}>
      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </Badge>
  );
};

export default StatusBadge;
