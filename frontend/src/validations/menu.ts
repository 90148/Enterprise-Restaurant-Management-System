import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().optional(),
  displayOrder: z.coerce.number().min(0).default(0),
  active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const modifierItemSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  price: z.coerce.number().min(0, 'Price must be >= 0').default(0),
  active: z.boolean().default(true),
});

export const modifierGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(100),
  minSelection: z.coerce.number().min(0).default(0),
  maxSelection: z.coerce.number().min(1).default(1),
  active: z.boolean().default(true),
  modifiers: z.array(modifierItemSchema).min(1, 'Add at least one modifier option'),
});

export type ModifierGroupFormValues = z.infer<typeof modifierGroupSchema>;

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Item name must be at least 2 characters').max(100),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  costPrice: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(5),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  prepTimeMinutes: z.coerce.number().min(1).max(120).default(15),
  specialInstructions: z.string().optional(),
  modifierGroupIds: z.array(z.string()).default([]),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
