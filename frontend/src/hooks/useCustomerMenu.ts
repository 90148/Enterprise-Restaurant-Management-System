import { useState, useEffect, useMemo } from 'react';
import { FoodCategory, FoodItem } from '@/types/customer';
import {
  getCategories,
  getMenuItems,
  getPopularItems,
  getChefSpecials,
  getCombos,
  MenuFilterParams,
} from '@/services/customerService';

export const useCustomerMenu = (initialCategory = 'all') => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterParams, setFilterParams] = useState<MenuFilterParams>({
    sortBy: 'popular',
  });
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [chefSpecials, setChefSpecials] = useState<FoodItem[]>([]);
  const [combos, setCombos] = useState<FoodItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getCategories(),
      getMenuItems(),
      getPopularItems(),
      getChefSpecials(),
      getCombos(),
    ]).then(([cats, items, pop, specials, comboList]) => {
      if (isMounted) {
        setCategories(cats);
        setAllItems(items);
        setPopularDishes(pop);
        setChefSpecials(specials);
        setCombos(comboList);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute filtered items synchronously for blazing-fast instant UI responsiveness
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        (item) => item.categoryId.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.cuisine.toLowerCase().includes(q) ||
          (item.ingredients && item.ingredients.some((ing) => ing.toLowerCase().includes(q))) ||
          (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // Dietary preferences
    if (filterParams.dietary && filterParams.dietary.length > 0) {
      if (filterParams.dietary.includes('VEG')) {
        result = result.filter((item) => item.isVeg);
      }
      if (filterParams.dietary.includes('NON_VEG')) {
        result = result.filter((item) => !item.isVeg);
      }
      if (filterParams.dietary.includes('SPICY')) {
        result = result.filter((item) => item.isSpicy);
      }
    }

    // Price range
    if (filterParams.priceRange) {
      const [min, max] = filterParams.priceRange;
      result = result.filter((item) => item.price >= min && (max === Infinity || item.price <= max));
    }

    // Rating filter
    if (filterParams.minRating && filterParams.minRating > 0) {
      result = result.filter((item) => item.rating >= filterParams.minRating!);
    }

    // Only available
    if (filterParams.onlyAvailable) {
      result = result.filter((item) => item.isAvailable);
    }

    // Sorting
    if (filterParams.sortBy) {
      switch (filterParams.sortBy) {
        case 'popular':
          result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        case 'recommended':
          result.sort(
            (a, b) =>
              (b.isChefSpecial ? 1 : 0) +
              (b.isBestseller ? 1 : 0) -
              ((a.isChefSpecial ? 1 : 0) + (a.isBestseller ? 1 : 0))
          );
          break;
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'prep_time':
          result.sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes);
          break;
      }
    }

    return result;
  }, [allItems, selectedCategory, searchQuery, filterParams]);

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterParams,
    setFilterParams,
    items: filteredItems,
    allItems,
    popularDishes,
    chefSpecials,
    combos,
    isLoading,
  };
};
