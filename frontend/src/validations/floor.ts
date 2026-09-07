import { z } from 'zod';

export const floorSchema = z.object({
  name: z.string().min(2, 'Floor name must be at least 2 characters').max(50, 'Floor name cannot exceed 50 characters'),
  floorNumber: z.coerce.number().min(1, 'Floor number must be at least 1'),
  active: z.boolean().default(true),
});

export type FloorFormValues = z.infer<typeof floorSchema>;
