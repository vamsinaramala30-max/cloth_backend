import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

const mapCollection = (c: any) => {
  return {
    _id: c.id,
    id: c.id,
    name: c.name,
    title: c.title,
    slug: c.slug,
    description: c.description,
    longDescription: c.long_description,
    image: c.image,
    bannerImage: c.banner_image,
    accentColor: c.accent_color,
    featuredProducts: c.featured_products || [],
    productCount: Number(c.product_count || 0),
    displayOrder: Number(c.display_order || 0),
    isActive: c.is_active,
    seoTitle: c.seo_title,
    seoDescription: c.seo_description,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
};

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      data: (collections || []).map(mapCollection),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collections';
    res.status(500).json({ success: false, message });
  }
};

export const getCollectionBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { data: collection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !collection) {
      res.status(404).json({ success: false, message: 'Collection not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: mapCollection(collection),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collection';
    res.status(500).json({ success: false, message });
  }
};

export const getCollectionProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { data: collection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !collection) {
      res.status(404).json({ success: false, message: 'Collection not found' });
      return;
    }

    // Find products where 'collections' array contains this collection's slug or name
    // or if the product's ID is in the collection's featuredProducts array
    let query = supabase.from('products').select('*').eq('is_active', true);

    const conditions: string[] = [
      `collections.cs.{"${slug}"}`,
      `collections.cs.{"${collection.name}"}`,
    ];

    if (collection.featured_products && collection.featured_products.length > 0) {
      const uuidsStr = collection.featured_products.map((id: string) => `"${id}"`).join(',');
      conditions.push(`id.in.(${uuidsStr})`);
    }

    query = query.or(conditions.join(',')).order('created_at', { ascending: false });

    const { data: products, error: prodError } = await query;

    if (prodError) {
      res.status(500).json({ success: false, message: prodError.message });
      return;
    }

    // Fetch variants for matching products
    const productIds = (products || []).map((p) => p.id);
    let allVariants: any[] = [];
    if (productIds.length > 0) {
      const { data: varData } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds);
      allVariants = varData || [];
    }

    const mappedProducts = (products || []).map((p) => {
      const pVariants = allVariants
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
        variants: pVariants,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });

    res.status(200).json({
      success: true,
      data: mappedProducts,
      pagination: {
        total: mappedProducts.length,
        page: 1,
        pages: 1,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collection products';
    res.status(500).json({ success: false, message });
  }
};
