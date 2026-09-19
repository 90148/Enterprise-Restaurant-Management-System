import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem } from '@/types/customer';
import { SAMPLE_MENU_ITEMS } from '@/services/customerMenuData';

interface CustomerFavoritesContextType {
  favoriteIds: string[];
  toggleFavorite: (dishId: string) => void;
  isFavorite: (dishId: string) => boolean;
  favoriteDishes: FoodItem[];
}

const CustomerFavoritesContext = createContext<CustomerFavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'restomaster_customer_favorites';

export const CustomerFavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['dish-1', 'dish-4', 'dish-8', 'dish-16'];
      }
    }
    return ['dish-1', 'dish-4', 'dish-8', 'dish-16'];
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (dishId: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId);
      } else {
        return [...prev, dishId];
      }
    });
  };

  const isFavorite = (dishId: string): boolean => {
    return favoriteIds.includes(dishId);
  };

  const favoriteDishes = SAMPLE_MENU_ITEMS.filter((dish) => favoriteIds.includes(dish.id));

  return (
    <CustomerFavoritesContext.Provider
      value={{
        favoriteIds,
        toggleFavorite,
        isFavorite,
        favoriteDishes,
      }}
    >
      {children}
    </CustomerFavoritesContext.Provider>
  );
};

export const useCustomerFavoritesContext = () => {
  const context = useContext(CustomerFavoritesContext);
  if (!context) {
    throw new Error('useCustomerFavoritesContext must be used within a CustomerFavoritesProvider');
  }
  return context;
};
