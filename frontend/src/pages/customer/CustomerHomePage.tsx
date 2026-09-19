import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useCustomerMenu } from '@/hooks/useCustomerMenu';
import { HeroBanner } from '@/components/customer/home/HeroBanner';
import { CategorySlider } from '@/components/customer/home/CategorySlider';
import { RecommendationCarousel } from '@/components/customer/home/RecommendationCarousel';
import { FoodGrid } from '@/components/customer/menu/FoodGrid';
import { SearchBar } from '@/components/customer/menu/SearchBar';
import { FilterDrawer } from '@/components/customer/menu/FilterDrawer';
import { FoodDetailsModal } from '@/components/customer/menu/FoodDetailsModal';
import { FoodItem } from '@/types/customer';
import { SAMPLE_COUPONS } from '@/services/customerMenuData';
import { useCustomerCartContext } from '@/context/CustomerCartContext';

export const CustomerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, activeOutlet } = useCustomerContext();
  const { applyCouponCode, setIsCartOpen } = useCustomerCartContext();

  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterParams,
    setFilterParams,
    items,
    popularDishes,
    chefSpecials,
    combos,
    isLoading,
  } = useCustomerMenu('all');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detailedItem, setDetailedItem] = useState<FoodItem | null>(null);

  // Time-based welcome greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleApplyPromo = (code: string) => {
    applyCouponCode(code);
    setIsCartOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <span>{getGreeting()}, {customer.name || 'Gourmet Lover'} 👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              What tantalizing delicacy would you like to feast on today at{' '}
              <strong className="text-amber-400">{activeOutlet?.name || 'Chennai Central'}</strong>?
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/customer/menu')}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Promotional Hero Carousel */}
      <HeroBanner />

      {/* Search & Quick Discovery Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
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
      </div>

      {/* Horizontal Category Navigation Bar */}
      <CategorySlider
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          if (id !== 'all') {
            navigate(`/customer/menu?category=${id}`);
          }
        }}
      />

      {/* When user searches, show search results directly; otherwise show curated sections */}
      {searchQuery.trim() !== '' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <FoodGrid
            items={items}
            isLoading={isLoading}
            onViewDetails={(item) => setDetailedItem(item)}
            title={`Search Results for "${searchQuery}"`}
            subtitle="Explore freshly prepared dishes crafted to perfection"
          />
        </div>
      ) : (
        <>
          {/* Section 1: Popular Dishes (Best Sellers) */}
          <RecommendationCarousel
            title="Popular Near You"
            subtitle="The most-ordered dishes beloved by food enthusiasts this week"
            badge="Customer Favorites"
            items={popularDishes}
            onViewDetails={(item) => setDetailedItem(item)}
          />

          {/* Section 2: Chef's Signature Specials */}
          <RecommendationCarousel
            title="Chef's Signature Masterpieces"
            subtitle="Handcrafted heritage recipes slow-cooked with royal whole spices"
            badge="Artisanal Selection"
            items={chefSpecials}
            onViewDetails={(item) => setDetailedItem(item)}
          />

          {/* Promotional Offers Grid Banner */}
          <section className="w-full py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_COUPONS.slice(0, 2).map((coupon) => (
                  <div
                    key={coupon.code}
                    className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl border border-amber-500/30 flex items-center justify-between gap-4 shadow-xl"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Tag className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {coupon.code}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{coupon.title}</h4>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPromo(coupon.code)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition-colors shadow-lg shadow-amber-500/20"
                    >
                      Apply Coupon
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Value Combos & Royal Feasts */}
          <RecommendationCarousel
            title="Chef Combos & Family Feasts"
            subtitle="Complete multi-course banquet feasts designed for sharing"
            badge="Maximum Value"
            items={combos}
            onViewDetails={(item) => setDetailedItem(item)}
          />

          {/* All Delicacies Showcase */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <FoodGrid
              items={items.slice(0, 12)}
              isLoading={isLoading}
              onViewDetails={(item) => setDetailedItem(item)}
              title="Signature Gourmet Menu"
              subtitle="Freshly prepared upon your order in our clay tandoor and wood-fired hearths"
            />

            <div className="text-center pt-8">
              <button
                type="button"
                onClick={() => navigate('/customer/menu')}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all inline-flex items-center gap-2"
              >
                <span>Explore All 30+ Menu Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filterParams}
        onApply={(newFilters) => setFilterParams(newFilters)}
      />

      {/* Detailed Food Information Modal */}
      <FoodDetailsModal
        foodItem={detailedItem}
        onClose={() => setDetailedItem(null)}
      />
    </div>
  );
};

export default CustomerHomePage;
