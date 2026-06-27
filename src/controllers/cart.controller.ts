import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

function getUserId(req: Request): string | undefined {
  return req.user?.id;
}

async function fetchCartObject(userId: string) {
  // 1. Get or create cart
  let { data: cart } = await supabase.from('cart').select('*').eq('user_id', userId).maybeSingle();
  if (!cart) {
    const { data: newCart } = await supabase.from('cart').insert({ user_id: userId }).select().single();
    cart = newCart;
  }

  // 2. Get cart items
  const { data: items } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id);

  // 3. Populate product details
  const productIds = (items || []).map((item) => item.product_id);
  let products: any[] = [];
  let variants: any[] = [];
  if (productIds.length > 0) {
    const { data: prodData } = await supabase.from('products').select('*').in('id', productIds);
    products = prodData || [];
    const { data: varData } = await supabase.from('product_variants').select('*').in('product_id', productIds);
    variants = varData || [];
  }

  const mappedItems = (items || []).map((item) => {
    const prod = products.find((p) => p.id === item.product_id);
    const pVariants = (variants || [])
      .filter((v) => v.product_id === item.product_id)
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
      _id: item.id,
      id: item.id,
      productId: prod
        ? {
            _id: prod.id,
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            basePrice: Number(prod.base_price),
            salePrice: prod.sale_price !== null && prod.sale_price !== undefined ? Number(prod.sale_price) : undefined,
            category: prod.category,
            collections: prod.collections || [],
            tags: prod.tags || [],
            isFeatured: prod.is_featured,
            isActive: prod.is_active,
            popularity: Number(prod.popularity || 0),
            variants: pVariants,
            createdAt: prod.created_at,
            updatedAt: prod.updated_at,
          }
        : item.product_id,
      variantSku: item.variant_sku,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: item.image,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  });

  return {
    _id: cart.id,
    id: cart.id,
    userId: cart.user_id,
    items: mappedItems,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
  };
}

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { productId, variantSku, quantity, size, color } = req.body as {
      productId: string;
      variantSku?: string;
      quantity: number;
      size?: string;
      color?: string;
    };

    if (!productId || quantity < 1) {
      res.status(400).json({ success: false, message: 'Invalid product or quantity' });
      return;
    }

    // 1. Get Product Details
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const { data: productVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    // 2. Find or Create Cart
    let { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).maybeSingle();
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('cart')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createError || !newCart) {
        res.status(500).json({ success: false, message: createError?.message || 'Failed to create cart' });
        return;
      }
      cart = newCart;
    }

    // 3. Check if item already exists in this cart
    let query = supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId);

    if (size) query = query.eq('size', size);
    else query = query.is('size', null);

    if (color) query = query.eq('color', color);
    else query = query.is('color', null);

    const { data: existingItems } = await query;
    const existingItem = existingItems?.[0];

    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      // Find variant image
      const matchVar = (productVariants || []).find((v) => v.sku === variantSku);
      const itemImage = matchVar?.images?.[0] || (productVariants || [])[0]?.images?.[0] || '';

      // Insert new cart item
      await supabase.from('cart_items').insert({
        cart_id: cart.id,
        product_id: productId,
        variant_sku: variantSku,
        quantity,
        size,
        color,
        price: product.sale_price ?? product.base_price,
        name: product.name,
        image: itemImage,
      });
    }

    // 4. Retrieve complete updated cart
    const updatedCart = await fetchCartObject(userId);

    res.status(200).json({ success: true, message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add to cart';
    res.status(500).json({ success: false, message });
  }
};

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const cartObj = await fetchCartObject(userId);

    res.status(200).json({
      success: true,
      data: cartObj,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get cart';
    res.status(500).json({ success: false, message });
  }
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { itemId } = req.params;
    const { quantity } = req.body as { quantity: number };

    if (quantity < 0) {
      res.status(400).json({ success: false, message: 'Invalid quantity' });
      return;
    }

    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).maybeSingle();
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    if (quantity === 0) {
      await supabase.from('cart_items').delete().eq('id', itemId).eq('cart_id', cart.id);
    } else {
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId).eq('cart_id', cart.id);
    }

    const updatedCart = await fetchCartObject(userId);

    res.status(200).json({ success: true, message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update cart';
    res.status(500).json({ success: false, message });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).maybeSingle();
    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      await supabase.from('cart').delete().eq('id', cart.id);
    }

    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear cart';
    res.status(500).json({ success: false, message });
  }
};
