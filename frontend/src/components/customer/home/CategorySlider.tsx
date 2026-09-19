import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Flame,
  Sparkles,
  Pizza,
  Soup,
  Coffee,
  CookingPot,
  Cake,
  GlassWater,
  Crown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FoodCategory } from '@/types/customer';

interface CategorySliderProps {
  categories: FoodCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isSticky?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Flame,
  Sparkles,
  Pizza,
  Soup,
  Coffee,
  CookingPot,
  Cake,
  GlassWater,
  Crown,
};

export const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isSticky = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`w-full py-4 transition-all ${
        isSticky
          ? 'sticky top-18 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg'
          : 'relative'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Navigation Left/Right Scroll Arrows */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 text-white items-center justify-center hover:bg-slate-700 shadow-md transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 text-white items-center justify-center hover:bg-slate-700 shadow-md transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory.toLowerCase() === category.id.toLowerCase();
            const IconComponent = ICON_MAP[category.iconName] || Utensils;

            return (
              <motion.button
                key={category.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory(category.id)}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800 text-amber-400 border border-slate-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs tracking-tight block whitespace-nowrap">
                    {category.name}
                  </span>
                  <span
                    className={`text-[10px] block ${
                      isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {category.itemCount} items
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
