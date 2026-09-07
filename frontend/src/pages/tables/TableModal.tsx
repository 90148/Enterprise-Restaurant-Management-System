import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { tableSchema, type TableFormValues } from '@/validations/table';
import type { RestaurantTable } from '@/types/table';
import type { Floor } from '@/types/floor';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TableFormValues) => Promise<void>;
  table?: RestaurantTable | null;
  floors: Floor[];
  defaultFloorId?: string;
  isLoading?: boolean;
}

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  table,
  floors,
  defaultFloorId,
  isLoading = false,
}) => {
  const isEdit = Boolean(table);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      floorId: defaultFloorId || (floors[0]?.id ?? ''),
      tableNumber: '',
      capacity: 4,
      shape: 'SQUARE',
      posX: 50,
      posY: 50,
      active: true,
    },
  });

  useEffect(() => {
    if (table) {
      reset({
        floorId: table.floorId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        shape: table.shape,
        posX: table.posX,
        posY: table.posY,
        active: table.active,
      });
    } else {
      reset({
        floorId: defaultFloorId || (floors[0]?.id ?? ''),
        tableNumber: '',
        capacity: 4,
        shape: 'SQUARE',
        posX: 50,
        posY: 50,
        active: true,
      });
    }
  }, [table, defaultFloorId, floors, reset, isOpen]);

  const handleFormSubmit = async (data: TableFormValues) => {
    await onSubmit(data);
  };

  const floorOptions = floors.map((f) => ({
    value: f.id,
    label: `${f.name} (Level ${f.floorNumber})`,
  }));

  const shapeOptions = [
    { value: 'SQUARE', label: 'Square (Standard dining, 2-4 seats)' },
    { value: 'ROUND', label: 'Round (Family / Cafe, 2-6 seats)' },
    { value: 'RECTANGLE', label: 'Rectangle (Large group / Banquet, 6-12 seats)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Table: ${table?.tableNumber}` : 'Add New Dining Table'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Assigned Floor / Area"
          options={floorOptions}
          error={errors.floorId?.message}
          required
          {...register('floorId')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Table Number / Code"
            placeholder="e.g. T-01, VIP-1"
            error={errors.tableNumber?.message}
            required
            {...register('tableNumber')}
          />

          <Input
            label="Seating Capacity (Guests)"
            type="number"
            min={1}
            max={50}
            placeholder="e.g. 4"
            error={errors.capacity?.message}
            required
            {...register('capacity')}
          />
        </div>

        <Select
          label="Table Shape & Geometry"
          options={shapeOptions}
          error={errors.shape?.message}
          required
          {...register('shape')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Layout Position X (px)"
            type="number"
            min={0}
            placeholder="e.g. 60"
            error={errors.posX?.message}
            {...register('posX')}
          />

          <Input
            label="Layout Position Y (px)"
            type="number"
            min={0}
            placeholder="e.g. 60"
            error={errors.posY?.message}
            {...register('posY')}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="tableActive"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
            {...register('active')}
          />
          <label htmlFor="tableActive" className="text-xs text-slate-300 font-medium">
            Active and visible on floor plan
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Table'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TableModal;
