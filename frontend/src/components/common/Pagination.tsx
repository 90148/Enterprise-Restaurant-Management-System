import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startElement = totalElements !== undefined && pageSize !== undefined
    ? currentPage * pageSize + 1
    : undefined;
  const endElement = totalElements !== undefined && pageSize !== undefined
    ? Math.min((currentPage + 1) * pageSize, totalElements)
    : undefined;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          {totalElements !== undefined && (
            <p className="text-xs text-slate-600">
              Showing <span className="font-medium">{startElement}</span> to{' '}
              <span className="font-medium">{endElement}</span> of{' '}
              <span className="font-medium">{totalElements}</span> results
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Prev
          </Button>
          <span className="text-xs font-medium text-slate-700 px-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
