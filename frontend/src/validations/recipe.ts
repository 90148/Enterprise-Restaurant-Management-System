import { z } from 'zod';

export const recipeIngredientSchema = z.object({
  inventoryItemId: z.string().min(1, 'Ingredient is required'),
  quantity: z.coerce.number().min(0.001, 'Quantity must be greater than 0'),
});

export const recipeSchema = z.object({
  instructions: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Add at least one raw ingredient to the recipe'),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
