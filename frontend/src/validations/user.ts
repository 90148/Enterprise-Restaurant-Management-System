import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().optional(),
  outletId: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().optional(),
  outletId: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
  password: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
