import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomerMenu } from '@/hooks/useCustomerMenu';
import { CategorySlider } from '@/components/customer/home/CategorySlider';
import { FoodGrid } from '@/components/customer/menu/FoodGrid';
import { SearchBar } from '@/components/customer/menu/SearchBar';
import { FilterDrawer } from '@/components/customer/menu/FilterDrawer';
import { FoodDetailsModal } from '@/components/customer/menu/FoodDetailsModal';
import { FoodItem, DietaryPreference } from '@/types/customer';
import { Sparkles, ArrowUpDown } from 'lucide-react';

export const CustomerMenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterParams,
    setFilterParams,
    items,
    isLoading,
  } = useCustomerMenu(initialCategory);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detailedItem, setDetailedItem] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch, setSearchQuery]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory, setSelectedCategory]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId === 'all') {
        next.delete('category');
      } else {
        next.set('category', catId);
      }
      return next;
    });
  };

  const toggleDietaryFilter = (diet: DietaryPreference) => {
    setFilterParams({
      ...filterParams,
      dietary: filterParams.dietary?.includes(diet)
        ? filterParams.dietary.filter((d) => d !== diet)
        : [...(filterParams.dietary || []), diet],
    });
  };

  const currentCategoryName =
    categories.find((c) => c.id.toLowerCase() === selectedCategory.toLowerCase())?.name ||
    'Full Dining Menu';

  return (
    <div className="space-y-6">
      {/* Top Header & Search Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Interactive Digital Menu
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {currentCategoryName}
          </h1>
          <p className="text-xs text-slate-400">
            Browse authentic artisanal dishes freshly plated for dine-in, takeaway, and delivery.
          </p>
        </div>

        {/* Search input with filter trigger */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onOpenFilter={() => setIsFilterOpen(true)}
          activeFilterCount={
            (filterParams.dietary?.length || 0) +
            (filterParams.priceRange ? 1 : 0) +
            (filterParams.minRating ? 1 : 0)
          }
        />

        {/* Quick Quick-Pill Toggles (Veg, Non-Veg, Spicy, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleDietaryFilter('VEG')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                filterParams.dietary?.includes('VEG')
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Veg Only</span>
            </button>

            <button
              type="button"
              onClick={() => toggleDietaryFilter('NON_VEG')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                filterParams.dietary?.includes('NON_VEG')
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Non-Veg</span>
            </button>

            <button
              type="button"
              onClick={() => toggleDietaryFilter('SPICY')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                filterParams.dietary?.includes('SPICY')
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span>🌶 Spicy</span>
            </button>
          </div>

          {/* Quick Sort dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filterParams.sortBy || 'popular'}
              onChange={(e) =>
                setFilterParams({ ...filterParams, sortBy: e.target.value as any })
              }
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-amber-500"
            >
              <option value="popular">Most Popular</option>
              <option value="recommended">Chef Recommended</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="prep_time">Prep Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation Bar */}
      <CategorySlider
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        isSticky
      />

      {/* Main Dishes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FoodGrid
          items={items}
          isLoading={isLoading}
          onViewDetails={(item) => setDetailedItem(item)}
        />
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filterParams}
        onApply={(newFilters) => setFilterParams(newFilters)}
      />

      {/* Food Details Modal */}
      <FoodDetailsModal
        foodItem={detailedItem}
        onClose={() => setDetailedItem(null)}
      />
    </div>
  );
};

export default CustomerMenuPage;
