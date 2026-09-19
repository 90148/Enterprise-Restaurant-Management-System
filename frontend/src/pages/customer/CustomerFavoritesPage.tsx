import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useCustomerFavoritesContext } from '@/context/CustomerFavoritesContext';
import { FoodCard } from '@/components/customer/menu/FoodCard';
import { FoodDetailsModal } from '@/components/customer/menu/FoodDetailsModal';
import { FoodItem } from '@/types/customer';

export const CustomerFavoritesPage: React.FC = () => {
  const { favoriteDishes, favoriteIds } = useCustomerFavoritesContext();
  const [detailedItem, setDetailedItem] = useState<FoodItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            Loved Delicacies
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          Your Saved Favorites ({favoriteIds.length})
        </h1>
        <p className="text-xs text-slate-400">
          Your curated collection of favorite gourmet dishes for quick 1-click ordering.
        </p>
      </div>

      {favoriteDishes.length === 0 ? (
        <div className="text-center py-20 px-4 bg-slate-900/50 rounded-3xl border border-slate-800 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Favorite Dishes Yet</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Tap the heart icon on any mouth-watering biryani, tandoori kebab, or pizza to save it here.
          </p>
          <Link
            to="/customer/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteDishes.map((dish) => (
            <FoodCard
              key={dish.id}
              foodItem={dish}
              onViewDetails={(item) => setDetailedItem(item)}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <FoodDetailsModal
        foodItem={detailedItem}
        onClose={() => setDetailedItem(null)}
      />
    </div>
  );
};

export default CustomerFavoritesPage;
