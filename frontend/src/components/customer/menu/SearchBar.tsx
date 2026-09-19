import React from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
  placeholder?: string;
}

const POPULAR_SEARCHES = [
  'Dum Biryani',
  'Butter Chicken',
  'Truffle Pizza',
  'Paneer Tikka',
  'Dal Bukhara',
  'Garlic Naan',
  'Brownie',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onOpenFilter,
  activeFilterCount = 0,
  placeholder = 'Search dishes, cuisines, ingredients (e.g. Biryani, Saffron, Pizza)...',
}) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-11 pr-10 py-3 bg-slate-900 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Trigger Button */}
        {onOpenFilter && (
          <button
            type="button"
            onClick={onOpenFilter}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-400 transition-all shrink-0 relative shadow"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Popular Search Suggestion Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Trending:
        </span>
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onChange(term)}
            className={`px-3 py-1 rounded-full text-xs shrink-0 transition-all border ${
              value.toLowerCase() === term.toLowerCase()
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};
