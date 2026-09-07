import { z } from 'zod';

export const outletSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
});

export type OutletFormData = z.infer<typeof outletSchema>;
