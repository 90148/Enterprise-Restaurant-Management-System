import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Sparkles, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { FoodVariant, SelectedModifier } from '@/types/customer';
import { useCustomerCartContext } from '@/context/CustomerCartContext';

export const CustomizationModal: React.FC = () => {
  const { customizingItem, closeCustomization, addItem } = useCustomerCartContext();

  const item = customizingItem;

  // Selected state
  const [selectedVariant, setSelectedVariant] = useState<FoodVariant | undefined>(undefined);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<number>(1);
  const [instructions, setInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize defaults on modal open
  useEffect(() => {
    if (item) {
      // Default variant
      const defVariant = item.variants?.find((v) => v.isDefault) || item.variants?.[0];
      setSelectedVariant(defVariant);

      // Default modifiers from required groups
      const initialMods: SelectedModifier[] = [];
      item.modifierGroups?.forEach((group) => {
        const defOpt = group.options.find((o) => o.isDefault) || (group.isRequired ? group.options[0] : undefined);
        if (defOpt) {
          initialMods.push({
            groupId: group.id,
            groupName: group.name,
            optionId: defOpt.id,
            optionName: defOpt.name,
            priceDelta: defOpt.priceDelta,
          });
        }
      });
      setSelectedModifiers(initialMods);

      setSpiceLevel(item.spiceLevel ?? 1);
      setInstructions('');
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  // Calculate dynamic unit price & grand total
  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const modifiersPrice = selectedModifiers.reduce((acc, m) => acc + m.priceDelta, 0);
  const unitPrice = basePrice + modifiersPrice;
  const totalPrice = unitPrice * quantity;

  const handleToggleModifier = (group: any, option: any) => {
    const isSingleSelect = group.maxSelection === 1;

    setSelectedModifiers((prev) => {
      const exists = prev.some((m) => m.groupId === group.id && m.optionId === option.id);

      if (isSingleSelect) {
        // Replace selection in this group
        const filtered = prev.filter((m) => m.groupId !== group.id);
        return [
          ...filtered,
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceDelta: option.priceDelta,
          },
        ];
      } else {
        if (exists) {
          return prev.filter((m) => !(m.groupId === group.id && m.optionId === option.id));
        } else {
          // Check group max selection
          const currentGroupCount = prev.filter((m) => m.groupId === group.id).length;
          if (group.maxSelection && currentGroupCount >= group.maxSelection) {
            return prev; // Reached limit
          }
          return [
            ...prev,
            {
              groupId: group.id,
              groupName: group.name,
              optionId: option.id,
              optionName: option.name,
              priceDelta: option.priceDelta,
            },
          ];
        }
      }
    });
  };

  const handleAddToCart = () => {
    addItem(
      item,
      {
        selectedVariant,
        selectedModifiers,
        spiceLevel,
        specialInstructions: instructions.trim() || undefined,
      },
      quantity
    );
    closeCustomization();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                Customize: {item.name}
              </h3>
              <p className="text-xs text-amber-400 font-semibold">Base Price: ₹{basePrice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCustomization}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Size / Portion Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Portion / Size</span>
                </h4>
                <span className="text-[10px] text-amber-400 font-semibold uppercase">Required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {item.variants.map((v) => {
                  const isChosen = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChosen
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChosen ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                          }`}
                        >
                          {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <span className="text-xs font-semibold">{v.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">₹{v.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Modifier Groups (Crusts, Extra Toppings, Add-ons) */}
          {item.modifierGroups?.map((group) => (
            <div key={group.id} className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {group.name}
                  </h4>
                  {group.description && (
                    <p className="text-[11px] text-slate-400">{group.description}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {group.isRequired ? (
                    <span className="text-amber-400 font-bold uppercase">Required</span>
                  ) : (
                    <span>Optional (Max {group.maxSelection})</span>
                  )}
                </span>
              </div>

              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isChecked = selectedModifiers.some(
                    (m) => m.groupId === group.id && m.optionId === opt.id
                  );
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleModifier(group, opt)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/80 text-white'
                          : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded ${
                            group.maxSelection === 1 ? 'rounded-full' : 'rounded-md'
                          } border flex items-center justify-center ${
                            isChecked ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{opt.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-300">
                        {opt.priceDelta > 0 ? `+₹${opt.priceDelta}` : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 3. Spice Level Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Customize Spice Level</span>
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { level: 0, label: 'No Spice' },
                { level: 1, label: 'Mild 🌶' },
                { level: 2, label: 'Medium 🌶🌶' },
                { level: 3, label: 'Fiery 🌶🌶🌶' },
              ].map((sp) => (
                <button
                  key={sp.level}
                  type="button"
                  onClick={() => setSpiceLevel(sp.level)}
                  className={`py-2 px-1 text-center text-xs rounded-xl border transition-all font-medium ${
                    spiceLevel === sp.level
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                      : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Special Cooking Instructions */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Special Kitchen Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less oil, extra onions on side, well done..."
              className="w-full p-3 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer with Quantity Counter & Dynamic Total Button */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dynamic Grand Total Add Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-between"
          >
            <span>Add Customized Item</span>
            <span className="text-sm font-black bg-slate-950/15 px-2.5 py-0.5 rounded-md">
              ₹{totalPrice}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
