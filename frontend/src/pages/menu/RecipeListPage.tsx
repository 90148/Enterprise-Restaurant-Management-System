import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import menuApi from '@/api/menu';
import recipeApi from '@/api/recipe';
import type { MenuItem } from '@/types/menu';
import type { SaveRecipePayload } from '@/types/recipe';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import StatCard from '@/components/common/StatCard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

import RecipeModal from './RecipeModal';

import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Percent,
  UtensilsCrossed,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const RecipeListPage: React.FC = () => {
  const { activeOutletId, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeStatusFilter, setRecipeStatusFilter] = useState<'ALL' | 'CONFIGURED' | 'MISSING'>('ALL');

  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const { data: categories = [] } = useQuery({
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

  const { data: availableIngredients = [] } = useQuery({
    queryKey: ['recipe-ingredients', activeOutletId],
    queryFn: () => recipeApi.getAvailableIngredients(activeOutletId!),
    enabled: Boolean(activeOutletId),
  });

  const allItems = menuItemsPage?.content || [];

  // Mutation
  const saveRecipeMutation = useMutation({
    mutationFn: (payload: SaveRecipePayload) => recipeApi.saveRecipe(payload),
    onSuccess: (savedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['recipe', savedRecipe.menuItemId] });
      setIsRecipeModalOpen(false);
      setSuccessMessage(`Recipe for "${savedRecipe.menuItemName}" saved successfully!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to save recipe BOM');
    },
  });

  // Filtered Items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchCat = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        recipeStatusFilter === 'ALL' ||
        (recipeStatusFilter === 'CONFIGURED' && item.hasRecipe) ||
        (recipeStatusFilter === 'MISSING' && !item.hasRecipe);

      return matchCat && matchSearch && matchStatus;
    });
  }, [allItems, selectedCategoryId, searchQuery, recipeStatusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = allItems.length;
    const configured = allItems.filter((i) => i.hasRecipe).length;
    const missing = total - configured;

    let sumMargin = 0;
    let countMargin = 0;
    for (const item of allItems) {
      if (item.profitMargin > 0) {
        sumMargin += Number(item.profitMargin);
        countMargin++;
      }
    }
    const avgMargin = countMargin > 0 ? (sumMargin / countMargin).toFixed(1) : '0';

    return { total, configured, missing, avgMargin };
  }, [allItems]);

  if (!activeOutletId) {
    return (
      <div className="p-8">
        <EmptyState
          title="No Active Outlet Selected"
          description="Please select an active outlet to manage recipes and ingredient formulas."
        />
      </div>
    );
  }

  if (isItemsLoading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading recipe bills of materials and ingredient matrices..." />
      </div>
    );
  }

  if (isItemsError) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to Load Recipe Data"
          message="An error occurred while communicating with the server."
          onRetry={() => refetchItems()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alert Banners */}
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
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            Recipe Management & Bill of Materials (BOM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map dishes to raw inventory ingredients for automated stock deduction and precise food cost control.
          </p>
        </div>

        <Link to="/menu/items">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Back to Menu Items
          </Button>
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Menu Offerings"
          value={metrics.total}
          icon={<UtensilsCrossed className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard
          title="Recipes Configured"
          value={metrics.configured}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Recipes Missing"
          value={metrics.missing}
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          title="Average Target Margin"
          value={`${metrics.avgMargin}%`}
          icon={<Percent className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              selectedCategoryId === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedCategoryId === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              options={[
                { value: 'ALL', label: 'All Recipes' },
                { value: 'CONFIGURED', label: 'BOM Configured' },
                { value: 'MISSING', label: 'Missing BOM' },
              ]}
              value={recipeStatusFilter}
              onChange={(e) => setRecipeStatusFilter(e.target.value as any)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Dish Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Selling Price</th>
                <th className="px-5 py-3.5">Calculated Food Cost</th>
                <th className="px-5 py-3.5">Gross Profit</th>
                <th className="px-5 py-3.5">Gross Margin</th>
                <th className="px-5 py-3.5">BOM Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No recipes matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const margin = Number(item.profitMargin || 0);
                  const price = Number(item.price || 0);
                  const cost = Number(item.costPrice || 0);
                  const profit = Math.max(0, price - cost);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-white text-sm">
                        {item.name}
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-medium">
                        {item.categoryName}
                      </td>
                      <td className="px-5 py-4 font-bold text-white text-sm">
                        ${price.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {cost > 0 ? `$${cost.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-emerald-400 font-semibold">
                        {cost > 0 ? `$${profit.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {cost > 0 ? (
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
                      <td className="px-5 py-4">
                        {item.hasRecipe ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/60">
                            <CheckCircle2 className="w-2.5 h-2.5" /> BOM Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            <AlertCircle className="w-2.5 h-2.5" /> Formula Missing
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {hasPermission('MENU_UPDATE') && (
                          <Button
                            size="sm"
                            variant={item.hasRecipe ? 'outline' : 'primary'}
                            onClick={() => {
                              setSelectedMenuItem(item);
                              setIsRecipeModalOpen(true);
                            }}
                            className="text-xs"
                          >
                            {item.hasRecipe ? 'Edit BOM' : 'Configure BOM'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe Modal */}
      {isRecipeModalOpen && selectedMenuItem && (
        <RecipeModal
          isOpen={isRecipeModalOpen}
          onClose={() => {
            setIsRecipeModalOpen(false);
            setSelectedMenuItem(null);
          }}
          menuItem={selectedMenuItem}
          availableIngredients={availableIngredients}
          onSave={async (payload) => {
            await saveRecipeMutation.mutateAsync(payload);
          }}
          isLoading={saveRecipeMutation.isPending}
        />
      )}
    </div>
  );
};

export default RecipeListPage;
