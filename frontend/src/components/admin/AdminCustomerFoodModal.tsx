import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Check,
  DollarSign,
  Clock,
  UtensilsCrossed,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { FoodItem, FoodVariant, ModifierGroup } from '@/types/customer';
import {
  getStoredCategories,
  addCustomerMenuItem,
  updateCustomerMenuItem,
  addCustomerCategory,
} from '@/services/customerService';
import Button from '@/components/common/Button';

interface AdminCustomerFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: FoodItem) => void;
  editItem?: FoodItem | null;
}

const PHOTO_PRESETS = [
  {
    name: 'Royal Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tandoori Starter',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gourmet Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Rich Butter Gravy',
    url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Truffle Pasta',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Artisan Dessert',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cocktail / Drink',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Crispy Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
];

const COMMON_ALLERGENS = ['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Shellfish', 'Sesame'];

export const AdminCustomerFoodModal: React.FC<AdminCustomerFoodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editItem,
}) => {
  const [categories, setCategories] = useState(() => getStoredCategories().filter((c) => c.id !== 'all'));
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cuisine, setCuisine] = useState('Indian Gourmet');
  const [price, setPrice] = useState<number>(350);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [isSpicy, setIsSpicy] = useState<boolean>(false);
  const [spiceLevel, setSpiceLevel] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isChefSpecial, setIsChefSpecial] = useState<boolean>(false);
  const [isBestseller, setIsBestseller] = useState<boolean>(false);

  // Nutrition Facts
  const [calories, setCalories] = useState<number>(450);
  const [protein, setProtein] = useState<number>(18);
  const [carbs, setCarbs] = useState<number>(45);
  const [fat, setFat] = useState<number>(14);

  // Allergens & Ingredients
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [ingredientsText, setIngredientsText] = useState('Fresh Farm Produce, Cold Pressed Oil, House Spices');

  // Portion Variants
  const [variants, setVariants] = useState<FoodVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPriceDelta, setNewVariantPriceDelta] = useState<number>(100);

  // Modifiers
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  // Errors & tabs
  const [activeTab, setActiveTab] = useState<'basic' | 'nutrition' | 'variants'>('basic');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cats = getStoredCategories().filter((c) => c.id !== 'all');
    setCategories(cats);

    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description);
      setCategoryId(editItem.categoryId);
      setCuisine(editItem.cuisine || 'Gourmet');
      setPrice(editItem.price);
      setPrepTimeMinutes(editItem.prepTimeMinutes);
      setIsVeg(Boolean(editItem.isVeg));
      setIsSpicy(Boolean(editItem.isSpicy));
      setSpiceLevel(editItem.spiceLevel || 1);
      setImageUrl(editItem.imageUrl);
      setIsAvailable(editItem.isAvailable !== false);
      setIsChefSpecial(Boolean(editItem.isChefSpecial));
      setIsBestseller(Boolean(editItem.isBestseller));
      setCalories(editItem.nutritionFacts?.calories || 400);
      setProtein(editItem.nutritionFacts?.proteinGrams || 15);
      setCarbs(editItem.nutritionFacts?.carbsGrams || 40);
      setFat(editItem.nutritionFacts?.fatGrams || 12);
      setSelectedAllergens(editItem.allergens || []);
      setIngredientsText(editItem.ingredients?.join(', ') || '');
      setVariants(editItem.variants || []);
      setModifierGroups(editItem.modifierGroups || []);
    } else {
      setName('');
      setDescription('');
      setCategoryId(cats[0]?.id || 'biryani');
      setCuisine('Indian Gourmet');
      setPrice(350);
      setPrepTimeMinutes(20);
      setIsVeg(true);
      setIsSpicy(false);
      setSpiceLevel(1);
      setImageUrl(PHOTO_PRESETS[0].url);
      setIsAvailable(true);
      setIsChefSpecial(false);
      setIsBestseller(false);
      setCalories(450);
      setProtein(18);
      setCarbs(45);
      setFat(14);
      setSelectedAllergens([]);
      setIngredientsText('Fresh Farm Produce, House Spices, Himalayan Pink Salt');
      setVariants([]);
      setModifierGroups([]);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat = addCustomerCategory({
      name: newCatName.trim(),
      iconName: 'Utensils',
      isPopular: true,
    });
    setCategories(getStoredCategories().filter((c) => c.id !== 'all'));
    setCategoryId(cat.id);
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    const v: FoodVariant = {
      id: `v-${Date.now()}`,
      name: newVariantName.trim(),
      price: Number(price) + (Number(newVariantPriceDelta) || 0),
      priceDelta: Number(newVariantPriceDelta) || 0,
      isDefault: variants.length === 0,
    };
    setVariants([...variants, v]);
    setNewVariantName('');
    setNewVariantPriceDelta(100);
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  const toggleAllergen = (all: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(all) ? prev.filter((a) => a !== all) : [...prev, all]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a dish name.');
      setActiveTab('basic');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a short description.');
      setActiveTab('basic');
      return;
    }
    if (price <= 0) {
      setError('Price must be greater than zero.');
      setActiveTab('basic');
      return;
    }

    const ingredients = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const dishPayload: Omit<FoodItem, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      categoryId: categoryId || 'biryani',
      cuisine: cuisine.trim() || 'Gourmet',
      price: Number(price),
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      isVeg,
      isSpicy,
      spiceLevel: isSpicy ? (spiceLevel as 0 | 1 | 2 | 3) : 0,
      imageUrl: imageUrl.trim() || PHOTO_PRESETS[0].url,
      isAvailable,
      isChefSpecial,
      isBestseller,
      rating: editItem?.rating || 4.9,
      reviewCount: editItem?.reviewCount || 1,
      nutritionFacts: {
        calories: Number(calories),
        proteinGrams: Number(protein),
        carbsGrams: Number(carbs),
        fatGrams: Number(fat),
      },
      allergens: selectedAllergens,
      ingredients,
      variants: variants.length > 0 ? variants : undefined,
      modifierGroups: modifierGroups.length > 0 ? modifierGroups : undefined,
      tags: [cuisine, isVeg ? 'Vegetarian' : 'Non-Veg', isChefSpecial ? "Chef's Special" : 'Gourmet'],
    };

    try {
      if (editItem) {
        const updated = updateCustomerMenuItem(editItem.id, dishPayload);
        onSuccess(updated);
      } else {
        const created = addCustomerMenuItem(dishPayload);
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save menu item');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editItem ? 'Edit Customer Menu Dish' : 'Add New Customer Menu Dish'}
              </h3>
              <p className="text-xs text-slate-400">
                Immediately updates the customer digital menu and ordering portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Basic Info & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'nutrition'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Nutrition & Allergens
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'variants'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Portions & Add-ons
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Dish Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hyderabadi Gosht Dum Biryani"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Cuisine Style</label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Mughlai, Italian, Pan-Asian"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category Dropdown & Quick Add */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Menu Category</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput((prev) => !prev)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showNewCatInput ? 'Cancel' : 'New Category'}</span>
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new category name..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Dish Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Appetizing culinary description for the customer menu..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Price & Prep Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Base Price (₹)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Prep Time (mins)</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={prepTimeMinutes}
                      onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dietary & Spice Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsVeg((v) => !v)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isVeg
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500 text-rose-400'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  />
                  <span>{isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !isSpicy;
                    setIsSpicy(next);
                    if (next && spiceLevel === 0) setSpiceLevel(1);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSpicy
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isSpicy ? `Spicy (${spiceLevel})` : 'Mild'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChefSpecial((c) => !c)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isChefSpecial
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chef Special</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBestseller((b) => !b)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isBestseller
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Bestseller</span>
                </button>
              </div>

              {/* Spice Level Selector when spicy */}
              {isSpicy && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Spice Intensity</span>
                    <span className="text-amber-400 font-bold">
                      {spiceLevel === 1 ? 'Mild Heat' : spiceLevel === 2 ? 'Medium Spicy' : 'Extra Hot 🔥'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSpiceLevel(lvl)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          spiceLevel === lvl
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        Level {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Showcase & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>High-Resolution Dish Photography</span>
                  <span className="text-[10px] text-slate-400">Click a preset or paste URL</span>
                </label>

                <div className="flex gap-2 items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={imageUrl || PHOTO_PRESETS[0].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap font-medium border transition-colors ${
                        imageUrl === preset.url
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Stock Availability Switch */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Dish In-Stock Status</h4>
                  <p className="text-[11px] text-slate-400">
                    When disabled, the dish appears as Out of Stock (86'd) on customer menus
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable((a) => !a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isAvailable
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {isAvailable ? 'In Stock' : 'Out of Stock'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION & ALLERGENS */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Nutritional Breakdown (per serving)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Calories (kcal)</span>
                    <input
                      type="number"
                      min={0}
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Protein (g)</span>
                    <input
                      type="number"
                      min={0}
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Carbohydrates (g)</span>
                    <input
                      type="number"
                      min={0}
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Fat (g)</span>
                    <input
                      type="number"
                      min={0}
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Allergen Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Allergen Warnings (Displayed in Customer Food Details)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMMON_ALLERGENS.map((all) => {
                    const checked = selectedAllergens.includes(all);
                    return (
                      <button
                        key={all}
                        type="button"
                        onClick={() => toggleAllergen(all)}
                        className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{all}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Ingredients List (Comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Basmati Rice, Marinated Mutton, Brown Onions, Ghee, Saffron, Rose Water..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS & ADD-ONS */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Portion Sizes / Variants (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. Regular, Large, Family Pack</span>
                </div>

                {/* Add Variant Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Variant name (e.g. Family Pack)"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    placeholder="Price +₹"
                    value={newVariantPriceDelta}
                    onChange={(e) => setNewVariantPriceDelta(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {/* List of existing variants */}
                {variants.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                      >
                        <span className="font-semibold text-white">{v.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 font-mono">
                            {v.priceDelta && v.priceDelta > 0 ? `+₹${v.priceDelta}` : 'Default Base'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="shadow-lg shadow-amber-500/20">
              {editItem ? 'Save Changes' : 'Publish Dish to Customer Menu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCustomerFoodModal;
