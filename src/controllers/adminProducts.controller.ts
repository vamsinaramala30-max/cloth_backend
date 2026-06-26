import type { Request, Response } from 'express';
import Product from '../models/product';

function normalizeSlug(input: unknown): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      basePrice,
      salePrice,
      category,
      collections,
      tags,
      variants,
      isFeatured,
      isActive,
    } = (req.body ?? {}) as Record<string, unknown>;

    if (!name) { res.status(400).json({ success: false, message: 'name is required' }); return; }
    if (!description) { res.status(400).json({ success: false, message: 'description is required' }); return; }
    if (basePrice === undefined || basePrice === null) { res.status(400).json({ success: false, message: 'basePrice is required' }); return; }
    if (!category) { res.status(400).json({ success: false, message: 'category is required' }); return; }

    const finalSlug = slug ? normalizeSlug(slug) : normalizeSlug(name);
    if (!finalSlug) { res.status(400).json({ success: false, message: 'slug is required' }); return; }

    const finalVariants = Array.isArray(variants) ? variants : [];

    const product = await Product.create({
      name: String(name).trim(),
      slug: finalSlug,
      description: String(description),
      basePrice: Number(basePrice),
      salePrice: salePrice === undefined ? undefined : Number(salePrice),
      category,
      collections: Array.isArray(collections) ? collections : [],
      tags: Array.isArray(tags) ? tags : [],
      variants: finalVariants,
      isFeatured: Boolean(isFeatured),
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    res.status(400).json({ success: false, message });
  }
};

export const listProductsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', isActive } = (req.query ?? {}) as Record<string, string | undefined>;

    const queryConfig: Record<string, unknown> = {};
    if (isActive !== undefined) queryConfig['isActive'] = String(isActive) === 'true';

    const p = Number(page);
    const l = Number(limit);
    const skipIndex = (p - 1) * l;

    const items = await Product.find(queryConfig)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(l);

    const total = await Product.countDocuments(queryConfig);

    res.status(200).json({
      success: true,
      data: items,
      pagination: { total, page: p, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list products';
    res.status(500).json({ success: false, message });
  }
};
