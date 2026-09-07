import React from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is no data to display currently.',
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingState message="Fetching data..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-6 py-3.5 ${column.className || ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-6 py-4 text-slate-700 ${column.className || ''}`}>
                  {column.render ? column.render(item) : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
