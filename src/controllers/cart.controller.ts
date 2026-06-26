import type { Request, Response } from 'express';
import Cart from '../models/cart';
import Product from '../models/product';
import { Types } from 'mongoose';

function getUserId(req: Request): string | undefined {
  return req.user?.id;
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

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex]!.quantity += quantity;
    } else {
      cart.items.push({
        _id: new Types.ObjectId(),
        productId: product._id,
        variantSku,
        quantity,
        size,
        color,
        price: product.salePrice ?? product.basePrice,
        name: product.name,
        image: product.variants?.[0]?.images?.[0] ?? '',
      });
    }

    await cart.save();

    res.status(200).json({ success: true, message: 'Item added to cart', cart });
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

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    res.status(200).json({
      success: true,
      data: cart ?? { userId, items: [] },
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

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    if (quantity === 0) {
      // Filter out the removed item
      const filtered = cart.items.filter((item) => item._id?.toString() !== itemId);
      cart.items.splice(0, cart.items.length, ...filtered);
    } else {
      const item = cart.items.find((i) => i._id?.toString() === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }

    await cart.save();

    res.status(200).json({ success: true, message: 'Cart updated', cart });
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

    await Cart.deleteOne({ userId });

    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear cart';
    res.status(500).json({ success: false, message });
  }
};
