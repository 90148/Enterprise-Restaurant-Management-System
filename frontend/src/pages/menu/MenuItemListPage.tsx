import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import menuApi from '@/api/menu';
import type { MenuCategory, MenuItem, ModifierGroup } from '@/types/menu';
import type { CategoryFormValues, MenuItemFormValues, ModifierGroupFormValues } from '@/validations/menu';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import StatCard from '@/components/common/StatCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

import CategoryModal from './CategoryModal';
import MenuItemModal from './MenuItemModal';
import ModifierGroupModal from './ModifierGroupModal';

import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Grid,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  Percent,
  Sliders,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const MenuItemListPage: React.FC = () => {
  const { activeOutletId, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingModifierGroup, setEditingModifierGroup] = useState<ModifierGroup | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'category' | 'item' | 'modifier';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'item',
    id: '',
    name: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Queries
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['menu-categories', activeOutletId],
    queryFn: () => menuApi.getCategories(activeOutletId!),
    enabled: Boolean(activeOutletId),
  });

  const {
    data: menuItemsPage,
    isLoading: isItemsLoading,
    isError: isItemsError,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ['menu-items', activeOutletId],
    queryFn: () =>
      menuApi.getMenuItems({
        outletId: activeOutletId!,
        size: 200,
        sort: 'name',
      }),
    enabled: Boolean(activeOutletId),
  });

  const { data: modifierGroups = [] } = useQuery({
    queryKey: ['modifier-groups', activeOutletId],
    queryFn: () => menuApi.getModifierGroups(activeOutletId!),
    enabled: Boolean(activeOutletId),
  });

  const allItems = menuItemsPage?.content || [];

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      menuApi.createCategory({
        outletId: activeOutletId!,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
        active: data.active,
      }),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', activeOutletId] });
      setIsCatModalOpen(false);
      setSuccessMessage(`Category "${newCat.name}" created!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      menuApi.updateCategory(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', activeOutletId] });
      setIsCatModalOpen(false);
      setEditingCategory(null);
      setSuccessMessage(`Category "${updated.name}" updated!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => menuApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', activeOutletId] });
      if (selectedCategoryId === deleteConfirm.id) setSelectedCategoryId('ALL');
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setSuccessMessage('Category deleted!');
    },
    onError: (err: any) => {
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setErrorMessage(err.response?.data?.message || 'Failed to delete category');
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: MenuItemFormValues) =>
      menuApi.createMenuItem({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        costPrice: data.costPrice,
        taxRate: data.taxRate,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable,
        prepTimeMinutes: data.prepTimeMinutes,
        specialInstructions: data.specialInstructions,
        modifierGroupIds: data.modifierGroupIds,
      }),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories', activeOutletId] });
      setIsItemModalOpen(false);
      setSuccessMessage(`Menu item "${newItem.name}" created!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuItemFormValues }) =>
      menuApi.updateMenuItem(id, {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        costPrice: data.costPrice,
        taxRate: data.taxRate,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable,
        prepTimeMinutes: data.prepTimeMinutes,
        specialInstructions: data.specialInstructions,
        modifierGroupIds: data.modifierGroupIds,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', activeOutletId] });
      setIsItemModalOpen(false);
      setEditingItem(null);
      setSuccessMessage(`Menu item "${updated.name}" updated!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update item');
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuApi.updateAvailability(id, isAvailable),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', activeOutletId] });
      setSuccessMessage(
        `"${updated.name}" is now ${updated.isAvailable ? 'IN STOCK' : '86\'d (OUT OF STOCK)'}!`
      );
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update availability');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => menuApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories', activeOutletId] });
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setSuccessMessage('Menu item deleted!');
    },
    onError: (err: any) => {
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setErrorMessage(err.response?.data?.message || 'Failed to delete item');
    },
  });

  const createModifierGroupMutation = useMutation({
    mutationFn: (data: ModifierGroupFormValues) =>
      menuApi.createModifierGroup({
        outletId: activeOutletId!,
        name: data.name,
        minSelection: data.minSelection,
        maxSelection: data.maxSelection,
        active: data.active,
        modifiers: data.modifiers,
      }),
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups', activeOutletId] });
      setIsModifierModalOpen(false);
      setSuccessMessage(`Modifier group "${newGroup.name}" created!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create modifier group');
    },
  });

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAvailability =
        availabilityFilter === 'ALL' ||
        (availabilityFilter === 'AVAILABLE' && item.isAvailable) ||
        (availabilityFilter === 'UNAVAILABLE' && !item.isAvailable);

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [allItems, selectedCategoryId, searchQuery, availabilityFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = allItems.length;
    const inStock = allItems.filter((i) => i.isAvailable).length;
    const outOfStock = total - inStock;
    const withRecipes = allItems.filter((i) => i.hasRecipe).length;
    return { total, inStock, outOfStock, withRecipes };
  }, [allItems]);

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.type === 'category') {
      await deleteCategoryMutation.mutateAsync(deleteConfirm.id);
    } else if (deleteConfirm.type === 'item') {
      await deleteItemMutation.mutateAsync(deleteConfirm.id);
    }
  };

  if (!activeOutletId) {
    return (
      <div className="p-8">
        <EmptyState
          title="No Active Outlet Selected"
          description="Please select an active outlet to manage menu items and pricing."
        />
      </div>
    );
  }

  if (isCategoriesLoading || isItemsLoading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading restaurant menu catalog, modifiers, and pricing..." />
      </div>
    );
  }

  if (isCategoriesError || isItemsError) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to Load Menu Catalog"
          message="An error occurred while communicating with the server."
          onRetry={() => {
            refetchCategories();
            refetchItems();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex justify-between items-center shadow-lg">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex justify-between items-center shadow-lg">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-400 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-wide flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-emerald-500" />
            Menu Catalog & Pricing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage food offerings, categories, profit margins, and instant 86-list availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/recipes">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Manage Recipes & BOM
            </Button>
          </Link>

          <Link to="/customer-management">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Customer Digital Menu
            </Button>
          </Link>

          {hasPermission('MENU_CREATE') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCategory(null);
                  setIsCatModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingModifierGroup(null);
                  setIsModifierModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                New Modifier Group
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Menu Item
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Menu Items"
          value={metrics.total}
          icon={<UtensilsCrossed className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard
          title="Available (In Stock)"
          value={metrics.inStock}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="86'd (Out of Stock)"
          value={metrics.outOfStock}
          icon={<XCircle className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          title="Configured Recipes"
          value={`${metrics.withRecipes} / ${metrics.total}`}
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Category Pills & Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('ALL')}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedCategoryId === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              )}
            >
              <span>All Items</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {allItems.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <div key={cat.id} className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={clsx(
                      'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    )}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-300'
                      )}
                    >
                      {cat.itemCount}
                    </span>
                  </button>

                  {isSelected && hasPermission('MENU_UPDATE') && (
                    <div className="flex items-center ml-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCatModalOpen(true);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirm({
                            isOpen: true,
                            type: 'category',
                            id: cat.id,
                            name: cat.name,
                          });
                        }}
                        className="p-1 hover:bg-rose-900/60 rounded text-slate-400 hover:text-rose-300"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View Mode & Filter */}
          <div className="flex items-center gap-2">
            <div className="w-48">
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Select
                options={[
                  { value: 'ALL', label: 'All Items' },
                  { value: 'AVAILABLE', label: 'In Stock' },
                  { value: 'UNAVAILABLE', label: '86\'d (Out of Stock)' },
                ]}
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              />
            </div>
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={clsx(
                  'p-1.5 rounded transition',
                  viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                )}
                title="Cards Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={clsx(
                  'p-1.5 rounded transition',
                  viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                )}
                title="Tabular List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No Menu Items Found"
          description={
            searchQuery
              ? 'No dishes matching your search query or availability filter.'
              : 'Start by adding delicious items to this category.'
          }
          actionText="Add Menu Item"
          onAction={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
        />
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const margin = Number(item.profitMargin || 0);
            return (
              <div
                key={item.id}
                className={clsx(
                  'flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 shadow-lg',
                  item.isAvailable
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/50 border-rose-950/60 opacity-80'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700/80">
                      {item.categoryName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          toggleAvailabilityMutation.mutate({
                            id: item.id,
                            isAvailable: !item.isAvailable,
                          })
                        }
                        className={clsx(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1',
                          item.isAvailable
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                            : 'bg-rose-950/60 text-rose-300 border-rose-700/60 hover:bg-rose-900'
                        )}
                        title="Click to toggle availability (86-list)"
                      >
                        {item.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5" /> 86'd
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.prepTimeMinutes}m
                    </span>
                    {item.modifierGroups?.length > 0 && (
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {item.modifierGroups.length} Modifiers
                      </span>
                    )}
                    {item.hasRecipe ? (
                      <span className="text-emerald-400 font-medium">BOM Active</span>
                    ) : (
                      <span className="text-slate-500">No Recipe</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-white">${Number(item.price).toFixed(2)}</span>
                      {item.costPrice > 0 && (
                        <span className="text-[10px] text-slate-500">Cost: ${Number(item.costPrice).toFixed(2)}</span>
                      )}
                    </div>
                    {item.costPrice > 0 && (
                      <span
                        className={clsx(
                          'text-[10px] font-bold flex items-center gap-0.5',
                          margin >= 60 ? 'text-emerald-400' : 'text-amber-400'
                        )}
                      >
                        <Percent className="w-2.5 h-2.5" /> {margin.toFixed(0)}% Margin
                      </span>
                    )}
                  </div>

                  {hasPermission('MENU_UPDATE') && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setIsItemModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirm({
                            isOpen: true,
                            type: 'item',
                            id: item.id,
                            name: item.name,
                          });
                        }}
                        className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular List View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Dish Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Food Cost</th>
                  <th className="px-5 py-3.5">Profit Margin</th>
                  <th className="px-5 py-3.5">Prep Time</th>
                  <th className="px-5 py-3.5">Recipe BOM</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredItems.map((item) => {
                  const margin = Number(item.profitMargin || 0);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-white text-sm">
                        {item.name}
                        {item.description && (
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">{item.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-300">{item.categoryName}</td>
                      <td className="px-5 py-4 font-bold text-white text-sm">${Number(item.price).toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {item.costPrice > 0 ? `$${Number(item.costPrice).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {item.costPrice > 0 ? (
                          <span
                            className={clsx(
                              'font-bold text-[11px] px-2 py-0.5 rounded',
                              margin >= 60
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            )}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400">{item.prepTimeMinutes}m</td>
                      <td className="px-5 py-4">
                        {item.hasRecipe ? (
                          <span className="text-emerald-400 font-medium">Configured</span>
                        ) : (
                          <span className="text-slate-500">Missing</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleAvailabilityMutation.mutate({
                              id: item.id,
                              isAvailable: !item.isAvailable,
                            })
                          }
                          className={clsx(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border transition',
                            item.isAvailable
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                              : 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                          )}
                        >
                          {item.isAvailable ? 'In Stock' : '86\'d'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {hasPermission('MENU_UPDATE') && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setIsItemModalOpen(true);
                              }}
                              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm({
                                  isOpen: true,
                                  type: 'item',
                                  id: item.id,
                                  name: item.name,
                                });
                              }}
                              className="p-1 hover:bg-rose-900/40 rounded text-slate-400 hover:text-rose-400"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCatModalOpen && (
        <CategoryModal
          isOpen={isCatModalOpen}
          onClose={() => {
            setIsCatModalOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={async (data) => {
            if (editingCategory) {
              await updateCategoryMutation.mutateAsync({
                id: editingCategory.id,
                data,
              });
            } else {
              await createCategoryMutation.mutateAsync(data);
            }
          }}
          category={editingCategory}
          isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        />
      )}

      {isItemModalOpen && (
        <MenuItemModal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={async (data) => {
            if (editingItem) {
              await updateItemMutation.mutateAsync({
                id: editingItem.id,
                data,
              });
            } else {
              await createItemMutation.mutateAsync(data);
            }
          }}
          item={editingItem}
          categories={categories}
          modifierGroups={modifierGroups}
          defaultCategoryId={selectedCategoryId !== 'ALL' ? selectedCategoryId : undefined}
          isLoading={createItemMutation.isPending || updateItemMutation.isPending}
        />
      )}

      {isModifierModalOpen && (
        <ModifierGroupModal
          isOpen={isModifierModalOpen}
          onClose={() => {
            setIsModifierModalOpen(false);
            setEditingModifierGroup(null);
          }}
          onSubmit={async (data) => {
            await createModifierGroupMutation.mutateAsync(data);
          }}
          group={editingModifierGroup}
          isLoading={createModifierGroupMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title={deleteConfirm.type === 'category' ? 'Delete Category' : 'Delete Menu Item'}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This operation cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCategoryMutation.isPending || deleteItemMutation.isPending}
      />
    </div>
  );
};

export default MenuItemListPage;
