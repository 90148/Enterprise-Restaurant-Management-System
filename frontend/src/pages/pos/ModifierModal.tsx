import React, { useState, useEffect } from 'react';
import { MenuItem, Modifier, ModifierGroup } from '@/types/menu';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Utensils, Check, AlertCircle } from 'lucide-react';

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onConfirm: (selectedModifiers: Modifier[], notes: string) => void;
}

export const ModifierModal: React.FC<ModifierModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Modifier[]>>({});
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (item && isOpen) {
      // Initialize pre-selections for single-choice required groups
      const initialSelections: Record<string, Modifier[]> = {};
      item.modifierGroups?.forEach((group) => {
        const isRequired = (group.minSelection && group.minSelection > 0) || !!group.isRequired;
        if (isRequired && group.minSelection === 1 && group.maxSelection === 1 && group.modifiers?.length) {
          initialSelections[group.id] = [group.modifiers[0]];
        } else {
          initialSelections[group.id] = [];
        }
      });
      setSelectedModifiers(initialSelections);
      setNotes('');
      setValidationError(null);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const handleSelectModifier = (group: ModifierGroup, mod: Modifier) => {
    const isSingleChoice = group.maxSelection === 1;
    const currentList = selectedModifiers[group.id] || [];

    if (isSingleChoice) {
      setSelectedModifiers((prev) => ({
        ...prev,
        [group.id]: [mod],
      }));
    } else {
      const alreadySelected = currentList.some((m) => m.id === mod.id);
      if (alreadySelected) {
        setSelectedModifiers((prev) => ({
          ...prev,
          [group.id]: currentList.filter((m) => m.id !== mod.id),
        }));
      } else {
        if (group.maxSelection && currentList.length >= group.maxSelection) {
          setValidationError(`You can select at most ${group.maxSelection} option(s) for ${group.name}`);
          return;
        }
        setSelectedModifiers((prev) => ({
          ...prev,
          [group.id]: [...currentList, mod],
        }));
      }
    }
    setValidationError(null);
  };

  const handleConfirm = () => {
    // Validate minSelection constraints
    if (item.modifierGroups) {
      for (const group of item.modifierGroups) {
        const count = (selectedModifiers[group.id] || []).length;
        const isRequired = (group.minSelection && group.minSelection > 0) || !!group.isRequired;
        if (isRequired && count < group.minSelection) {
          setValidationError(`Please select at least ${group.minSelection} option(s) for "${group.name}"`);
          return;
        }
      }
    }

    // Flatten all selected modifiers
    const allSelected: Modifier[] = Object.values(selectedModifiers).flat();
    onConfirm(allSelected, notes);
    onClose();
  };

  const basePrice = Number(item.price);
  const modifiersDelta = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, m) => sum + Number(m.price || 0), 0);
  const totalItemPrice = basePrice + modifiersDelta;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customize ${item.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Item Header Banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{item.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{item.description || 'Customizable menu item'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Price</div>
            <div className="text-base font-bold text-emerald-400">${totalItemPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modifier Groups */}
        <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
          {item.modifierGroups?.map((group) => {
            const isSingle = group.maxSelection === 1;
            const currentSelected = selectedModifiers[group.id] || [];
            const isRequired = (group.minSelection && group.minSelection > 0) || !!group.isRequired;

            return (
              <div key={group.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">{group.name}</span>
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400">
                      {isSingle
                        ? isRequired
                          ? 'Choose 1 (Required)'
                          : 'Choose 1 (Optional)'
                        : `Choose up to ${group.maxSelection} (${isRequired ? 'Required' : 'Optional'})`}
                    </span>
                  </div>
                  {isRequired && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Required
                    </span>
                  )}
                </div>

                {/* Modifiers List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.modifiers?.map((mod) => {
                    const isSelected = currentSelected.some((m) => m.id === mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleSelectModifier(group, mod)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-${isSingle ? 'full' : 'md'} border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{mod.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">
                          {Number(mod.price) > 0 ? `+$${Number(mod.price).toFixed(2)}` : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Instructions / Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Special Preparation Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Extra crispy, less spicy, sauce on side"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Base: ${basePrice.toFixed(2)}
            {modifiersDelta > 0 && ` + Addons: $${modifiersDelta.toFixed(2)}`}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Add to Order (${totalItemPrice.toFixed(2)})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
