import type { Request, Response } from 'express';
import Collection from '../models/collection';
import Product from '../models/product';

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = await Collection.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collections';
    res.status(500).json({ success: false, message });
  }
};

export const getCollectionBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const collection = await Collection.findOne({ slug, isActive: true }).lean();

    if (!collection) {
      res.status(404).json({ success: false, message: 'Collection not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collection';
    res.status(500).json({ success: false, message });
  }
};

export const getCollectionProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const collection = await Collection.findOne({ slug, isActive: true });

    if (!collection) {
      res.status(404).json({ success: false, message: 'Collection not found' });
      return;
    }

    // Find products where 'collections' array contains this collection's slug or name
    // or if the product is in the collection's featuredProducts
    const products = await Product.find({
      isActive: true,
      $or: [
        { collections: { $in: [slug, collection.name] } },
        { _id: { $in: collection.featuredProducts } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: products.length,
        page: 1,
        pages: 1,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collection products';
    res.status(500).json({ success: false, message });
  }
};
