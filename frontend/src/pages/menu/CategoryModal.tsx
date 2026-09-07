import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { categorySchema, type CategoryFormValues } from '@/validations/menu';
import type { MenuCategory } from '@/types/menu';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  category?: MenuCategory | null;
  isLoading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
}) => {
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      displayOrder: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder || 0,
        active: category.active,
      });
    } else {
      reset({
        name: '',
        description: '',
        displayOrder: 0,
        active: true,
      });
    }
  }, [category, reset, isOpen]);

  const handleFormSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Category: ${category?.name}` : 'Add New Menu Category'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Wood-Fired Pizzas, Starters"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            rows={2}
            className="w-full rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-500"
            placeholder="e.g. Authentic Neapolitan sourdough pizzas baked at 900°F"
            {...register('description')}
          />
        </div>

        <Input
          label="Display Sorting Order"
          type="number"
          min={0}
          placeholder="e.g. 1"
          error={errors.displayOrder?.message}
          {...register('displayOrder')}
        />

        <div className="flex items-center gap-2 pt-2">
          <input
            id="catActive"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
            {...register('active')}
          />
          <label htmlFor="catActive" className="text-xs text-slate-300 font-medium">
            Active and visible on menu
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
