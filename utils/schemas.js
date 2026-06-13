const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be 2+ characters'),
  email: z.string().email('Invalid email structure'),
  password: z.string().min(8, 'Password must be 8+ characters')
});

const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Provide extended luxury description'),
  basePrice: z.number().positive(),
  category: z.enum(['Men', 'Women', 'Kids', 'Unisex']),
  variants: z.array(z.object({
    sku: z.string(),
    color: z.string(),
    colorName: z.string(),
    size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    stock: z.number().int().nonnegative(),
    images: z.array(z.string().url())
  }))
});

module.exports = { registerSchema, productCreateSchema };