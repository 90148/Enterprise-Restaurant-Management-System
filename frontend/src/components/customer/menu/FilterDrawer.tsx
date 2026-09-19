import React, { useState } from 'react';
import { X, Check, RotateCcw, SlidersHorizontal, Flame } from 'lucide-react';
import { MenuFilterParams } from '@/services/customerService';
import { DietaryPreference } from '@/types/customer';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MenuFilterParams;
  onApply: (newFilters: MenuFilterParams) => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
}) => {
  const [dietary, setDietary] = useState<DietaryPreference[]>(filters.dietary || []);
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(filters.priceRange);
  const [minRating, setMinRating] = useState<number | undefined>(filters.minRating);
  const [sortBy, setSortBy] = useState<MenuFilterParams['sortBy']>(filters.sortBy || 'popular');

  if (!isOpen) return null;

  const toggleDietary = (pref: DietaryPreference) => {
    setDietary((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleReset = () => {
    setDietary([]);
    setPriceRange(undefined);
    setMinRating(undefined);
    setSortBy('popular');
  };

  const handleApply = () => {
    onApply({
      ...filters,
      dietary,
      priceRange,
      minRating,
      sortBy,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Filter & Sort Dishes</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter options body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Sort By */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Sort By
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'popular', label: 'Most Popular' },
                { key: 'recommended', label: 'Chef Recommended' },
                { key: 'rating', label: 'Top Customer Rated' },
                { key: 'prep_time', label: 'Fastest Prep Time' },
                { key: 'price_asc', label: 'Price: Low to High' },
                { key: 'price_desc', label: 'Price: High to Low' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSortBy(s.key as any)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    sortBy === s.key
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Dietary Preferences */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Food Type & Dietary
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => toggleDietary('VEG')}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  dietary.includes('VEG')
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Vegetarian</span>
              </button>

              <button
                type="button"
                onClick={() => toggleDietary('NON_VEG')}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  dietary.includes('NON_VEG')
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Non-Vegetarian</span>
              </button>

              <button
                type="button"
                onClick={() => toggleDietary('SPICY')}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  dietary.includes('SPICY')
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Spicy Lovers</span>
              </button>
            </div>
          </div>

          {/* 3. Price Brackets */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Price Range
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'All Prices', range: undefined },
                { label: 'Under ₹250', range: [0, 250] },
                { label: '₹250 – ₹450', range: [250, 450] },
                { label: '₹450 & Above', range: [450, Infinity] },
              ].map((p, idx) => {
                const isSelected =
                  (!priceRange && !p.range) ||
                  (priceRange && p.range && priceRange[0] === p.range[0] && priceRange[1] === p.range[1]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPriceRange(p.range as any)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Minimum Rating */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Minimum Rating
            </h4>
            <div className="flex gap-2">
              {[
                { label: 'Any', val: undefined },
                { label: '4.0+ ⭐', val: 4.0 },
                { label: '4.5+ ⭐', val: 4.5 },
                { label: '4.8+ ⭐', val: 4.8 },
              ].map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMinRating(r.val)}
                  className={`flex-1 py-2 rounded-xl border text-xs text-center transition-all ${
                    minRating === r.val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
