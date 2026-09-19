import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { FoodItem } from '@/types/customer';
import { FoodCard } from '../menu/FoodCard';

interface RecommendationCarouselProps {
  title: string;
  subtitle?: string;
  items: FoodItem[];
  badge?: string;
  onViewDetails?: (item: FoodItem) => void;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  title,
  subtitle,
  items,
  badge,
  onViewDetails,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with scroll controls */}
        <div className="flex items-end justify-between mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {badge && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {badge}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition-colors shadow"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition-colors shadow"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel items */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        >
          {items.map((item) => (
            <div key={item.id} className="w-72 sm:w-80 shrink-0">
              <FoodCard foodItem={item} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
