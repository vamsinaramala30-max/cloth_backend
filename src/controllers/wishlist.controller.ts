import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

function getUserId(req: Request): string | undefined {
  return req.user?.id;
}

export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { productId } = req.body as { productId: string };
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID required' });
      return;
    }

    // Check if product exists
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Insert into wishlist (ignore duplicate error if user already had it)
    await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });

    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      wishlist: (wishlist || []).map((w) => w.product_id),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add to wishlist';
    res.status(500).json({ success: false, message });
  }
};

export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { productId } = req.body as { productId: string };

    await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      wishlist: (wishlist || []).map((w) => w.product_id),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove from wishlist';
    res.status(500).json({ success: false, message });
  }
};

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    const productIds = (wishlist || []).map((w) => w.product_id);

    if (productIds.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds);

    const mapped = (products || []).map((p) => {
      const pVariants = (variants || [])
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

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get wishlist';
    res.status(500).json({ success: false, message });
  }
};
