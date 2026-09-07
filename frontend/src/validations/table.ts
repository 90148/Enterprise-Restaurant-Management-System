import { z } from 'zod';

export const tableSchema = z.object({
  floorId: z.string().min(1, 'Floor is required'),
  tableNumber: z.string().min(1, 'Table number is required').max(20, 'Table number cannot exceed 20 characters'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1 person').max(50, 'Capacity cannot exceed 50 people'),
  shape: z.enum(['SQUARE', 'ROUND', 'RECTANGLE'], { required_error: 'Shape is required' }),
  posX: z.coerce.number().min(0).default(50),
  posY: z.coerce.number().min(0).default(50),
  active: z.boolean().default(true),
});

export type TableFormValues = z.infer<typeof tableSchema>;
