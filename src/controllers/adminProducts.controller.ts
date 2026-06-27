import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

function normalizeSlug(input: unknown): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const mapProduct = (p: any, variants: any[]) => {
  const productVariants = (variants || [])
    .filter((v) => v.product_id === p.id)
    .map((v) => ({
      _id: v.id,
      id: v.id,
      sku: v.sku,
      color: v.color,
      colorName: v.color_name,
      size: v.size,
      stock: v.stock,
      images: v.images || [],
    }));

  return {
    _id: p.id,
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.base_price),
    salePrice: p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : undefined,
    category: p.category,
    collections: p.collections || [],
    tags: p.tags || [],
    isFeatured: p.is_featured,
    isActive: p.is_active,
    popularity: Number(p.popularity || 0),
    variants: productVariants,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

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
    } = (req.body ?? {}) as Record<string, any>;

    if (!name) { res.status(400).json({ success: false, message: 'name is required' }); return; }
    if (!description) { res.status(400).json({ success: false, message: 'description is required' }); return; }
    if (basePrice === undefined || basePrice === null) { res.status(400).json({ success: false, message: 'basePrice is required' }); return; }
    if (!category) { res.status(400).json({ success: false, message: 'category is required' }); return; }

    const finalSlug = slug ? normalizeSlug(slug) : normalizeSlug(name);
    if (!finalSlug) { res.status(400).json({ success: false, message: 'slug is required' }); return; }

    // 1. Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: String(name).trim(),
        slug: finalSlug,
        description: String(description),
        base_price: Number(basePrice),
        sale_price: salePrice === undefined ? undefined : Number(salePrice),
        category: String(category).trim(),
        collections: Array.isArray(collections) ? collections : [],
        tags: Array.isArray(tags) ? tags : [],
        is_featured: Boolean(isFeatured),
        is_active: isActive === undefined ? true : Boolean(isActive),
      })
      .select()
      .single();

    if (productError || !product) {
      res.status(400).json({ success: false, message: productError?.message || 'Failed to create product' });
      return;
    }

    // 2. Insert variants
    const finalVariants = Array.isArray(variants) ? variants : [];
    if (finalVariants.length > 0) {
      const dbVariants = finalVariants.map((v: any) => ({
        product_id: product.id,
        sku: v.sku,
        color: v.color,
        color_name: v.colorName,
        size: v.size,
        stock: v.stock || 0,
        images: v.images || [],
      }));

      const { error: variantsError } = await supabase.from('product_variants').insert(dbVariants);
      if (variantsError) {
        // Rollback
        await supabase.from('products').delete().eq('id', product.id);
        res.status(400).json({ success: false, message: variantsError.message });
        return;
      }
    }

    const { data: createdVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    res.status(201).json({ success: true, data: mapProduct(product, createdVariants || []) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    res.status(400).json({ success: false, message });
  }
};

export const listProductsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', isActive } = (req.query ?? {}) as Record<string, string | undefined>;

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (isActive !== undefined) {
      query = query.eq('is_active', String(isActive) === 'true');
    }

    const p = Number(page);
    const l = Number(limit);
    const from = (p - 1) * l;
    const to = from + l - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: items, count, error } = await query;

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    const total = count || 0;

    // Fetch variants
    const productIds = (items || []).map((prod) => prod.id);
    let allVariants: any[] = [];
    if (productIds.length > 0) {
      const { data: varData } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds);
      allVariants = varData || [];
    }

    const mapped = (items || []).map((prod) => mapProduct(prod, allVariants));

    res.status(200).json({
      success: true,
      data: mapped,
      pagination: { total, page: p, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list products';
    res.status(500).json({ success: false, message });
  }
};
