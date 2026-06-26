import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import env from '../config/env';
import Product from '../models/product';

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
      isFeatured,
      isActive,
      variants,
    } = req.body as Record<string, unknown>;

    const newProduct = new Product({
      name,
      slug,
      description,
      basePrice,
      salePrice,
      category,
      collections,
      tags,
      isFeatured,
      isActive,
      variants,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    res.status(400).json({ message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      basePrice,
      salePrice,
      category,
      collections,
      tags,
      isFeatured,
      isActive,
      variants,
    } = req.body as Record<string, unknown>;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, slug, description, basePrice, salePrice, category, collections, tags, isFeatured, isActive, variants },
      { new: true },
    );

    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    res.status(400).json({ message });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      collection,
      minPrice,
      maxPrice,
      color,
      size,
      availability,
      featured,
      newArrivals,
      bestSellers,
      sort,
      search,
      page = '1',
      limit = '12'
    } = req.query as Record<string, string | undefined>;

    const queryConfig: Record<string, any> = { isActive: true };

    if (category) {
      queryConfig['category'] = category;
    }
    if (collection) {
      queryConfig['collections'] = { $in: [collection] };
    }
    if (search) {
      queryConfig['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Price Filter (filtering by basePrice)
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, any> = {};
      if (minPrice) priceFilter['$gte'] = Number(minPrice);
      if (maxPrice) priceFilter['$lte'] = Number(maxPrice);
      queryConfig['basePrice'] = priceFilter;
    }

    // Color Filter
    if (color) {
      queryConfig['variants.colorName'] = { $regex: new RegExp(`^${color}$`, 'i') };
    }

    // Size Filter
    if (size) {
      queryConfig['variants.size'] = { $regex: new RegExp(`^${size}$`, 'i') };
    }

    // Availability Filter
    if (availability === 'true' || availability === 'in-stock') {
      queryConfig['variants.stock'] = { $gt: 0 };
    }

    // Featured Filter
    if (featured === 'true') {
      queryConfig['isFeatured'] = true;
    }

    // New Arrivals Filter (matches 'new-arrivals' collection or tag)
    if (newArrivals === 'true') {
      queryConfig['collections'] = { $in: ['new-arrivals'] };
    }

    // Best Sellers Filter (matches 'best-sellers' or 'heritage-collection')
    if (bestSellers === 'true') {
      queryConfig['collections'] = { $in: ['best-sellers', 'heritage-collection'] };
    }

    // Sorting configurations
    let sortConfig: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price-low-high' || sort === 'price-asc') {
      sortConfig = { basePrice: 1 };
    } else if (sort === 'price-high-low' || sort === 'price-desc') {
      sortConfig = { basePrice: -1 };
    } else if (sort === 'newest') {
      sortConfig = { createdAt: -1 };
    } else if (sort === 'popularity') {
      sortConfig = { popularity: -1, createdAt: -1 };
    } else if (sort === 'featured') {
      sortConfig = { isFeatured: -1, createdAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skipNum = (pageNum - 1) * limitNum;

    const products = await Product.find(queryConfig)
      .sort(sortConfig)
      .skip(skipNum)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(queryConfig);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalProducts / limitNum)
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    res.status(500).json({ success: false, message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const product = await Product.findOne(query).lean();

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    res.status(500).json({ success: false, message });
  }
};

export const getFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const collections = await Product.distinct('collections', { isActive: true });
    const colors = await Product.distinct('variants.colorName', { isActive: true });
    const sizes = await Product.distinct('variants.size', { isActive: true });

    res.status(200).json({
      success: true,
      data: {
        categories,
        collections: (collections as unknown[]).filter(Boolean),
        colors: (colors as unknown[]).filter(Boolean),
        sizes: (sizes as unknown[]).filter(Boolean)
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch filters';
    res.status(500).json({ success: false, message });
  }
};
