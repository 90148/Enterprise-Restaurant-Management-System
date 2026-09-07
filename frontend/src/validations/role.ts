import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Name must contain only uppercase letters, numbers, and underscores'),
  description: z.string().max(255).optional(),
  permissionIds: z.array(z.string()).default([]),
});

export const updateRoleSchema = z.object({
  description: z.string().max(255).optional(),
  permissionIds: z.array(z.string()).default([]),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;
