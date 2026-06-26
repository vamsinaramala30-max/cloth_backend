import type { Request, Response } from 'express';
import User from '../models/user';
import Product from '../models/product';

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

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.wishlist.some((id) => id.toString() === productId)) {
      user.wishlist.push(product._id);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Added to wishlist', wishlist: user.wishlist });
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

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const filtered = user.wishlist.filter((id) => id.toString() !== productId);
    user.wishlist.splice(0, user.wishlist.length, ...filtered);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      wishlist: user.wishlist,
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

    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get wishlist';
    res.status(500).json({ success: false, message });
  }
};
