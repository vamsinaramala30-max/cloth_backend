import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be 2+ characters'),
  email: z.string().email('Invalid email structure'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Provide extended luxury description'),
  basePrice: z.number().positive(),
  category: z.string().min(1, 'Category is required'),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        color: z.string(),
        colorName: z.string(),
        size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: z.number().int().nonnegative(),
        images: z.array(z.string().url()),
      }),
    )
    .optional(),
});

export const subscribeSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  source: z.string().trim().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
