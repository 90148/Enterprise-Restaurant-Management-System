import React from 'react';
import { X, Star, Clock, Flame, ShieldAlert, Sparkles, Heart, Plus } from 'lucide-react';
import { FoodItem } from '@/types/customer';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerFavoritesContext } from '@/context/CustomerFavoritesContext';

interface FoodDetailsModalProps {
  foodItem: FoodItem | null;
  onClose: () => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({ foodItem, onClose }) => {
  const { addItem, openCustomization } = useCustomerCartContext();
  const { isFavorite, toggleFavorite } = useCustomerFavoritesContext();

  if (!foodItem) return null;

  const isLiked = isFavorite(foodItem.id);
  const hasCustomizations = (foodItem.variants && foodItem.variants.length > 1) || (foodItem.modifierGroups && foodItem.modifierGroups.length > 0);

  const handleAddAction = () => {
    if (hasCustomizations) {
      onClose();
      openCustomization(foodItem);
    } else {
      addItem(foodItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Image Header */}
        <div className="relative w-full h-64 sm:h-72 shrink-0 bg-slate-950 overflow-hidden">
          <img
            src={foodItem.imageUrl}
            alt={foodItem.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

          {/* Floating tags */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center border bg-slate-950/90 backdrop-blur-md ${
                foodItem.isVeg ? 'border-emerald-500' : 'border-rose-600'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  foodItem.isVeg ? 'bg-emerald-500' : 'bg-rose-600'
                }`}
              />
            </div>
            {foodItem.isBestseller && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Bestseller
              </span>
            )}
            <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900/80 text-amber-300 border border-slate-700 rounded-full backdrop-blur-md">
              {foodItem.cuisine} Cuisine
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(foodItem.id)}
            className={`absolute bottom-4 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
              isLiked
                ? 'bg-rose-500/30 border-rose-500/50 text-rose-400'
                : 'bg-slate-900/70 border-slate-700 text-white hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Scrollable Details */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header & Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {foodItem.categoryName}
              </span>
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{foodItem.rating}</span>
                <span className="text-slate-400 font-normal">({foodItem.reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              {foodItem.name}
            </h2>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-white">₹{foodItem.price}</span>
              {foodItem.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  ₹{foodItem.originalPrice}
                </span>
              )}
              {foodItem.discountPercent && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {foodItem.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Highlights Grid (Time, Calories, Spice) */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Preparation Time</span>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{foodItem.prepTimeMinutes} mins</span>
              </div>
            </div>
            <div className="space-y-0.5 border-x border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">Energy</span>
              <div className="text-xs font-bold text-slate-200">
                {foodItem.calories || 520} kcal
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Spice Intensity</span>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5" />
                <span>
                  {foodItem.spiceLevel === 3
                    ? 'Extra Spicy'
                    : foodItem.spiceLevel === 2
                    ? 'Medium'
                    : foodItem.spiceLevel === 1
                    ? 'Mild'
                    : 'Non-Spicy'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              About This Dish
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {foodItem.description}
            </p>
          </div>

          {/* Key Ingredients */}
          {foodItem.ingredients && foodItem.ingredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Fresh Ingredients
              </h4>
              <div className="flex flex-wrap gap-2">
                {foodItem.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Notice */}
          {foodItem.allergens && foodItem.allergens.length > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-300">Allergen Notice: </span>
                <span className="text-rose-200/80">Contains {foodItem.allergens.join(', ')}.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Price</span>
            <span className="text-xl font-extrabold text-white">₹{foodItem.price}</span>
          </div>

          <button
            type="button"
            onClick={handleAddAction}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{hasCustomizations ? 'Customize Dish' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
