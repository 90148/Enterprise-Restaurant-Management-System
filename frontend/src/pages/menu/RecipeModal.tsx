import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import recipeApi from '@/api/recipe';
import type { MenuItem } from '@/types/menu';
import type { InventoryItemSummary, SaveRecipePayload } from '@/types/recipe';
import { Plus, Trash2, Calculator, Percent, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  availableIngredients: InventoryItemSummary[];
  onSave: (payload: SaveRecipePayload) => Promise<void>;
  isLoading?: boolean;
}

interface IngredientRow {
  inventoryItemId: string;
  quantity: number;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  menuItem,
  availableIngredients,
  onSave,
  isLoading = false,
}) => {
  const [instructions, setInstructions] = useState('');
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch existing recipe if menuItem is selected
  const { data: existingRecipe, isLoading: isRecipeLoading } = useQuery({
    queryKey: ['recipe', menuItem?.id],
    queryFn: () => recipeApi.getRecipeByMenuItem(menuItem!.id),
    enabled: Boolean(menuItem && isOpen),
    retry: false,
  });

  useEffect(() => {
    if (existingRecipe) {
      setInstructions(existingRecipe.instructions || '');
      setIngredientRows(
        existingRecipe.items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
        }))
      );
    } else {
      setInstructions('');
      setIngredientRows([]);
    }
  }, [existingRecipe, menuItem, isOpen]);

  const handleAddIngredient = () => {
    if (availableIngredients.length === 0) return;
    setIngredientRows((prev) => [
      ...prev,
      { inventoryItemId: availableIngredients[0].id, quantity: 1 },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof IngredientRow, value: any) => {
    setIngredientRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Real-time Cost & Margin calculations
  const { totalCost, grossProfit, grossMargin } = useMemo(() => {
    let sum = 0;
    for (const row of ingredientRows) {
      const ing = availableIngredients.find((i) => i.id === row.inventoryItemId);
      if (ing) {
        sum += (ing.unitCost || 0) * (row.quantity || 0);
      }
    }
    const price = Number(menuItem?.price || 0);
    const profit = Math.max(0, price - sum);
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return {
      totalCost: sum,
      grossProfit: profit,
      grossMargin: margin,
    };
  }, [ingredientRows, availableIngredients, menuItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;

    if (ingredientRows.length === 0) {
      setValidationError('Please add at least one ingredient to the recipe.');
      return;
    }

    for (const row of ingredientRows) {
      if (!row.quantity || row.quantity <= 0) {
        setValidationError('Ingredient quantities must be greater than zero.');
        return;
      }
    }

    setValidationError(null);
    await onSave({
      menuItemId: menuItem.id,
      instructions,
      ingredients: ingredientRows.map((r) => ({
        inventoryItemId: r.inventoryItemId,
        quantity: Number(r.quantity),
      })),
    });
  };

  if (!menuItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Recipe & Bill of Materials (BOM): ${menuItem.name}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg">
            {validationError}
          </div>
        )}

        {/* Dish Overview & Profit Matrix Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Selling Price</p>
            <p className="text-base font-bold text-white">${Number(menuItem.price).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Calculated Food Cost</p>
            <p className="text-base font-bold text-amber-400">${totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Gross Profit / Serving</p>
            <p className="text-base font-bold text-emerald-400">${grossProfit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Gross Margin</p>
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full mt-0.5',
                grossMargin >= 65
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              )}
            >
              <Percent className="w-3 h-3" /> {grossMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Ingredients Bill of Materials List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Raw Ingredients Bill of Materials (BOM)
              </label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 text-xs py-1 h-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add Ingredient
            </Button>
          </div>

          {ingredientRows.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
              <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-400 mb-2">No raw ingredients added to this recipe formula yet.</p>
              <Button type="button" size="sm" variant="outline" onClick={handleAddIngredient}>
                + Add First Ingredient
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {ingredientRows.map((row, idx) => {
                const selectedInv = availableIngredients.find((i) => i.id === row.inventoryItemId);
                const lineCost = selectedInv ? selectedInv.unitCost * (row.quantity || 0) : 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60"
                  >
                    <div className="flex-1">
                      <select
                        value={row.inventoryItemId}
                        onChange={(e) => handleIngredientChange(idx, 'inventoryItemId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
                      >
                        {availableIngredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.sku}) • ${Number(ing.unitCost).toFixed(2)} / {ing.unitSymbol}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28 flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={row.quantity}
                        onChange={(e) => handleIngredientChange(idx, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white px-2 py-1.5 focus:border-emerald-500 focus:outline-none text-right font-mono"
                      />
                      <span className="text-xs text-slate-400 font-semibold w-8">
                        {selectedInv?.unitSymbol || ''}
                      </span>
                    </div>

                    <div className="w-20 text-right">
                      <span className="text-xs font-mono font-bold text-white">
                        ${lineCost.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700 transition"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chef Preparation Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Chef Preparation Instructions & Method
          </label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-500 leading-relaxed"
            placeholder="Step-by-step culinary preparation instructions, cooking temperature, plating tips..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading || isRecipeLoading}>
            Save Recipe BOM
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecipeModal;
