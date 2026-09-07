import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { menuItemSchema, type MenuItemFormValues } from '@/validations/menu';
import type { MenuItem, MenuCategory, ModifierGroup } from '@/types/menu';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormValues) => Promise<void>;
  item?: MenuItem | null;
  categories: MenuCategory[];
  modifierGroups: ModifierGroup[];
  defaultCategoryId?: string;
  isLoading?: boolean;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  categories,
  modifierGroups,
  defaultCategoryId,
  isLoading = false,
}) => {
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: defaultCategoryId || (categories[0]?.id ?? ''),
      name: '',
      description: '',
      price: 0,
      costPrice: 0,
      taxRate: 5,
      imageUrl: '',
      isAvailable: true,
      prepTimeMinutes: 15,
      specialInstructions: '',
      modifierGroupIds: [],
    },
  });

  const selectedModifierGroupIds = watch('modifierGroupIds') || [];

  useEffect(() => {
    if (item) {
      reset({
        categoryId: item.categoryId,
        name: item.name,
        description: item.description || '',
        price: item.price,
        costPrice: item.costPrice || 0,
        taxRate: item.taxRate || 5,
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable,
        prepTimeMinutes: item.prepTimeMinutes || 15,
        specialInstructions: item.specialInstructions || '',
        modifierGroupIds: item.modifierGroups ? item.modifierGroups.map((g) => g.id) : [],
      });
    } else {
      reset({
        categoryId: defaultCategoryId || (categories[0]?.id ?? ''),
        name: '',
        description: '',
        price: 0,
        costPrice: 0,
        taxRate: 5,
        imageUrl: '',
        isAvailable: true,
        prepTimeMinutes: 15,
        specialInstructions: '',
        modifierGroupIds: [],
      });
    }
  }, [item, defaultCategoryId, categories, reset, isOpen]);

  const handleToggleModifierGroup = (groupId: string) => {
    if (selectedModifierGroupIds.includes(groupId)) {
      setValue(
        'modifierGroupIds',
        selectedModifierGroupIds.filter((id) => id !== groupId)
      );
    } else {
      setValue('modifierGroupIds', [...selectedModifierGroupIds, groupId]);
    }
  };

  const handleFormSubmit = async (data: MenuItemFormValues) => {
    await onSubmit(data);
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Menu Item: ${item?.name}` : 'Add New Menu Item'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Category"
          options={categoryOptions}
          error={errors.categoryId?.message}
          required
          {...register('categoryId')}
        />

        <Input
          label="Item Name"
          placeholder="e.g. Margherita D.O.P Pizza"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            rows={2}
            className="w-full rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-500"
            placeholder="e.g. Crushed San Marzano tomatoes, fresh mozzarella, basil, EVOO"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Selling Price ($)"
            type="number"
            step="0.01"
            min={0}
            placeholder="14.50"
            error={errors.price?.message}
            required
            {...register('price')}
          />

          <Input
            label="Cost Price ($)"
            type="number"
            step="0.01"
            min={0}
            placeholder="3.25"
            error={errors.costPrice?.message}
            {...register('costPrice')}
          />

          <Input
            label="Tax Rate (%)"
            type="number"
            step="0.1"
            min={0}
            placeholder="5.0"
            error={errors.taxRate?.message}
            {...register('taxRate')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Est. Prep Time (Mins)"
            type="number"
            min={1}
            placeholder="15"
            error={errors.prepTimeMinutes?.message}
            {...register('prepTimeMinutes')}
          />

          <Input
            label="Image URL (Optional)"
            placeholder="https://..."
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Chef Notes & Dietary Info (Optional)
          </label>
          <input
            className="w-full rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white px-3 py-2 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
            placeholder="e.g. Contains Dairy, Gluten-free crust available on request"
            {...register('specialInstructions')}
          />
        </div>

        {/* Modifier Groups Checkbox Matrix */}
        {modifierGroups.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Attached Modifier Groups & Variations
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modifierGroups.map((group) => {
                const isChecked = selectedModifierGroupIds.includes(group.id);
                return (
                  <div
                    key={group.id}
                    onClick={() => handleToggleModifierGroup(group.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                        : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{group.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {group.modifiers.length} options (Min: {group.minSelection}, Max: {group.maxSelection})
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <input
            id="itemAvailable"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
            {...register('isAvailable')}
          />
          <label htmlFor="itemAvailable" className="text-xs text-slate-300 font-medium">
            Available for ordering (unchecked puts on 86-list)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MenuItemModal;
