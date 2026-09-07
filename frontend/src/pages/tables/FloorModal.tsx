import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { floorSchema, type FloorFormValues } from '@/validations/floor';
import type { Floor } from '@/types/floor';

interface FloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FloorFormValues) => Promise<void>;
  floor?: Floor | null;
  isLoading?: boolean;
}

export const FloorModal: React.FC<FloorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  floor,
  isLoading = false,
}) => {
  const isEdit = Boolean(floor);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FloorFormValues>({
    resolver: zodResolver(floorSchema),
    defaultValues: {
      name: '',
      floorNumber: 1,
      active: true,
    },
  });

  useEffect(() => {
    if (floor) {
      reset({
        name: floor.name,
        floorNumber: floor.floorNumber,
        active: floor.active,
      });
    } else {
      reset({
        name: '',
        floorNumber: 1,
        active: true,
      });
    }
  }, [floor, reset, isOpen]);

  const handleFormSubmit = async (data: FloorFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Floor: ${floor?.name}` : 'Add New Floor / Dining Area'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Floor Name"
          placeholder="e.g. Ground Floor - Main Dining"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Input
          label="Floor Level Number"
          type="number"
          min={1}
          placeholder="e.g. 1"
          error={errors.floorNumber?.message}
          required
          {...register('floorNumber')}
        />

        <div className="flex items-center gap-2 pt-2">
          <input
            id="floorActive"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
            {...register('active')}
          />
          <label htmlFor="floorActive" className="text-xs text-slate-300 font-medium">
            Active and available for seating
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Floor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FloorModal;
