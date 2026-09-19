import React from 'react';
import { FoodItem } from '@/types/customer';
import { FoodCard } from './FoodCard';
import { Utensils, Sparkles } from 'lucide-react';

interface FoodGridProps {
  items: FoodItem[];
  isLoading?: boolean;
  onViewDetails?: (item: FoodItem) => void;
  title?: string;
  subtitle?: string;
}

export const FoodGrid: React.FC<FoodGridProps> = ({
  items,
  isLoading = false,
  onViewDetails,
  title,
  subtitle,
}) => {
  if (isLoading) {
    return (
      <div className="w-full">
        {title && (
          <div className="mb-6 space-y-1">
            <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-800/60 rounded animate-pulse" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden animate-pulse flex flex-col h-80"
            >
              <div className="h-48 bg-slate-800" />
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-full" />
                </div>
                <div className="h-8 bg-slate-800 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-slate-900/50 rounded-3xl border border-slate-800 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Culinary Creations Found</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          We couldn't find any dishes matching your current filter or search criteria. Try adjusting your dietary tags or searching for a different keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            {title && (
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{title}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-amber-400">{items.length}</strong> delicacies
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <FoodCard key={item.id} foodItem={item} onViewDetails={onViewDetails} />
        ))}
      </div>
    </div>
  );
};
