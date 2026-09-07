import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { modifierGroupSchema, type ModifierGroupFormValues } from '@/validations/menu';
import type { ModifierGroup } from '@/types/menu';
import { Plus, Trash2 } from 'lucide-react';

interface ModifierGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModifierGroupFormValues) => Promise<void>;
  group?: ModifierGroup | null;
  isLoading?: boolean;
}

export const ModifierGroupModal: React.FC<ModifierGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  group,
  isLoading = false,
}) => {
  const isEdit = Boolean(group);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModifierGroupFormValues>({
    resolver: zodResolver(modifierGroupSchema),
    defaultValues: {
      name: '',
      minSelection: 0,
      maxSelection: 1,
      active: true,
      modifiers: [{ name: '', price: 0, active: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'modifiers',
  });

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        minSelection: group.minSelection,
        maxSelection: group.maxSelection,
        active: group.active,
        modifiers: group.modifiers.map((m) => ({
          name: m.name,
          price: m.price,
          active: m.active,
        })),
      });
    } else {
      reset({
        name: '',
        minSelection: 0,
        maxSelection: 1,
        active: true,
        modifiers: [
          { name: 'Regular', price: 0, active: true },
          { name: 'Large', price: 3, active: true },
        ],
      });
    }
  }, [group, reset, isOpen]);

  const handleFormSubmit = async (data: ModifierGroupFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Modifier Group: ${group?.name}` : 'Create Modifier Group'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Modifier Group Name"
          placeholder="e.g. Size Selection, Extra Add-ons, Spice Level"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min Selection (0 for optional)"
            type="number"
            min={0}
            error={errors.minSelection?.message}
            required
            {...register('minSelection')}
          />
          <Input
            label="Max Selection (1 for single-choice)"
            type="number"
            min={1}
            error={errors.maxSelection?.message}
            required
            {...register('maxSelection')}
          />
        </div>

        {/* Dynamic Modifiers List */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Variation Options & Add-on Prices
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', price: 0, active: true })}
              className="flex items-center gap-1 text-[11px] py-1 h-auto"
            >
              <Plus className="w-3 h-3" /> Add Option
            </Button>
          </div>

          {errors.modifiers?.message && (
            <p className="text-xs text-rose-400 mb-2">{errors.modifiers.message}</p>
          )}

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                <div className="flex-1">
                  <input
                    placeholder="Option name (e.g. Extra Cheese)"
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
                    {...register(`modifiers.${idx}.name` as const)}
                  />
                  {errors.modifiers?.[idx]?.name && (
                    <p className="text-[10px] text-rose-400 mt-0.5">{errors.modifiers[idx]?.name?.message}</p>
                  )}
                </div>

                <div className="w-28">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.25"
                      min={0}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white pl-5 pr-2 py-1.5 focus:border-emerald-500 focus:outline-none"
                      {...register(`modifiers.${idx}.price` as const)}
                    />
                  </div>
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="groupActive"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
            {...register('active')}
          />
          <label htmlFor="groupActive" className="text-xs text-slate-300 font-medium">
            Active and available for selection
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Group'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModifierGroupModal;
