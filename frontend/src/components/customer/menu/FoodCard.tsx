import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Plus, Minus, Flame, Clock, Sparkles, SlidersHorizontal } from 'lucide-react';
import { FoodItem } from '@/types/customer';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerFavoritesContext } from '@/context/CustomerFavoritesContext';

interface FoodCardProps {
  foodItem: FoodItem;
  onViewDetails?: (item: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ foodItem, onViewDetails }) => {
  const { addItem, updateQuantity, getItemQuantity, openCustomization, cartItems } =
    useCustomerCartContext();
  const { isFavorite, toggleFavorite } = useCustomerFavoritesContext();

  const isLiked = isFavorite(foodItem.id);
  const totalQuantityInCart = getItemQuantity(foodItem.id);
  const hasCustomizations = (foodItem.variants && foodItem.variants.length > 1) || (foodItem.modifierGroups && foodItem.modifierGroups.length > 0);

  // Find cart item id for non-customized or first matching item to increment/decrement
  const matchingCartItem = cartItems.find((ci) => ci.foodItem.id === foodItem.id);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCustomizations) {
      openCustomization(foodItem);
    } else {
      addItem(foodItem);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchingCartItem) {
      updateQuantity(matchingCartItem.cartItemId, 1);
    } else {
      addItem(foodItem);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchingCartItem) {
      updateQuantity(matchingCartItem.cartItemId, -1);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => onViewDetails && onViewDetails(foodItem)}
      className="group relative bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col cursor-pointer"
    >
      {/* Food Photography Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-950">
        <motion.img
          src={foodItem.imageUrl}
          alt={foodItem.name}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Veg / Non-Veg Indicator Icon */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border bg-slate-950/90 backdrop-blur-md ${
              foodItem.isVeg
                ? 'border-emerald-500'
                : 'border-rose-600'
            }`}
            title={foodItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                foodItem.isVeg ? 'bg-emerald-500' : 'bg-rose-600'
              }`}
            />
          </div>

          {/* Bestseller Badge */}
          {foodItem.isBestseller && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Bestseller
            </span>
          )}

          {/* Chef Special Badge */}
          {foodItem.isChefSpecial && !foodItem.isBestseller && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded-full shadow-md flex items-center gap-1">
              Chef Special
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(foodItem.id);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
            isLiked
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-rose-400 hover:bg-slate-900'
          }`}
          title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
        </motion.button>

        {/* Prep Time & Calories Floating Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Clock className="w-3 h-3 text-amber-400" />
            {foodItem.prepTimeMinutes} mins
          </span>

          {foodItem.spiceLevel && foodItem.spiceLevel > 0 ? (
            <span className="flex items-center gap-0.5 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-sm text-orange-400">
              <Flame className="w-3 h-3 text-orange-400" />
              {'🌶'.repeat(foodItem.spiceLevel)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating & Review count */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              {foodItem.categoryName}
            </span>
            <div className="flex items-center gap-1 text-slate-300 font-bold bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/60">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{foodItem.rating}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({foodItem.reviewCount})
              </span>
            </div>
          </div>

          {/* Dish Name */}
          <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-1">
            {foodItem.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {foodItem.description}
          </p>
        </div>

        {/* Price & Add to Cart Controls */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="leading-tight">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-white">
                ₹{foodItem.price}
              </span>
              {foodItem.originalPrice && foodItem.originalPrice > foodItem.price && (
                <span className="text-xs text-slate-500 line-through">
                  ₹{foodItem.originalPrice}
                </span>
              )}
            </div>
            {hasCustomizations && (
              <span className="text-[10px] text-amber-400 font-medium block">
                Customizable
              </span>
            )}
          </div>

          {/* Add / Morphing Quantity Controller */}
          {totalQuantityInCart > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-amber-500 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-500/20 px-1 py-0.5"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center hover:bg-amber-600 rounded-lg transition-colors text-slate-950"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="w-6 text-center text-xs font-black">
                {totalQuantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center hover:bg-amber-600 rounded-lg transition-colors text-slate-950"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {hasCustomizations && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCustomization(foodItem);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 rounded-xl transition-colors"
                  title="Customize dish"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleAddClick}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
