import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

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
      isFeatured,
      isActive,
      variants,
    } = req.body as Record<string, any>;

    // 1. Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        description,
        base_price: basePrice,
        sale_price: salePrice,
        category,
        collections: collections || [],
        tags: tags || [],
        is_featured: isFeatured ?? false,
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (productError || !product) {
      res.status(400).json({ message: productError?.message || 'Failed to create product' });
      return;
    }

    // 2. Insert variants
    if (variants && variants.length > 0) {
      const dbVariants = variants.map((v: any) => ({
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
        // Cleanup product if variant insertion failed
        await supabase.from('products').delete().eq('id', product.id);
        res.status(400).json({ message: variantsError.message });
        return;
      }
    }

    // Fetch complete product with variants
    const { data: createdVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    res.status(201).json(mapProduct(product, createdVariants || []));
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
    } = req.body as Record<string, any>;

    // 1. Update product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name,
        slug,
        description,
        base_price: basePrice,
        sale_price: salePrice,
        category,
        collections: collections || [],
        tags: tags || [],
        is_featured: isFeatured,
        is_active: isActive,
      })
      .eq('id', id)
      .select()
      .single();

    if (productError || !product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // 2. Update variants (delete old and insert new)
    if (variants) {
      await supabase.from('product_variants').delete().eq('product_id', id);

      if (variants.length > 0) {
        const dbVariants = variants.map((v: any) => ({
          product_id: id,
          sku: v.sku,
          color: v.color,
          color_name: v.colorName,
          size: v.size,
          stock: v.stock || 0,
          images: v.images || [],
        }));

        await supabase.from('product_variants').insert(dbVariants);
      }
    }

    // Fetch updated variants
    const { data: updatedVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id);

    res.json(mapProduct(product, updatedVariants || []));
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
      limit = '12',
    } = req.query as Record<string, string | undefined>;

    // 1. Filter by variants if color/size/availability is specified
    let hasVariantFilter = false;
    let matchingProductIds: string[] = [];

    if (color || size || availability === 'true' || availability === 'in-stock') {
      hasVariantFilter = true;
      let variantQuery = supabase.from('product_variants').select('product_id');
      if (color) variantQuery = variantQuery.ilike('color_name', color);
      if (size) variantQuery = variantQuery.ilike('size', size);
      if (availability === 'true' || availability === 'in-stock') {
        variantQuery = variantQuery.gt('stock', 0);
      }

      const { data: varData } = await variantQuery;
      matchingProductIds = Array.from(new Set((varData || []).map((v) => v.product_id)));

      if (matchingProductIds.length === 0) {
        res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 },
        });
        return;
      }
    }

    // 2. Build main product query
    let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

    if (hasVariantFilter) {
      query = query.in('id', matchingProductIds);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (collection) {
      query = query.contains('collections', [collection]);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (newArrivals === 'true') {
      query = query.contains('collections', ['new-arrivals']);
    }
    if (bestSellers === 'true') {
      // In MongoDB: $in: ['best-sellers', 'heritage-collection']
      // We can query with OR / overlapping arrays
      query = query.or('collections.cs.{"best-sellers"},collections.cs.{"heritage-collection"}');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (minPrice) {
      query = query.gte('base_price', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('base_price', Number(maxPrice));
    }

    // 3. Sorting
    if (sort === 'price-low-high' || sort === 'price-asc') {
      query = query.order('base_price', { ascending: true });
    } else if (sort === 'price-high-low' || sort === 'price-desc') {
      query = query.order('base_price', { ascending: false });
    } else if (sort === 'popularity') {
      query = query.order('popularity', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'featured') {
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 4. Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: products, count, error } = await query;

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    const total = count || 0;

    // 5. Fetch variants for matching products
    const productIds = (products || []).map((p) => p.id);
    let allVariants: any[] = [];
    if (productIds.length > 0) {
      const { data: varData } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds);
      allVariants = varData || [];
    }

    const mapped = (products || []).map((p) => mapProduct(p, allVariants));

    res.status(200).json({
      success: true,
      data: mapped,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    res.status(500).json({ success: false, message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    // Check if UUID or slug
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    let query = supabase.from('products').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: product, error } = await query.maybeSingle();

    if (error || !product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    res.status(200).json({ success: true, data: mapProduct(product, variants || []) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    res.status(500).json({ success: false, message });
  }
};

export const getFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    // Select categories and collections from products
    const { data: prods } = await supabase
      .from('products')
      .select('category, collections')
      .eq('is_active', true);

    const { data: vars } = await supabase
      .from('product_variants')
      .select('color_name, size');

    const categories = Array.from(new Set((prods || []).map((p) => p.category).filter(Boolean)));
    const collections = Array.from(new Set((prods || []).flatMap((p) => (p.collections as string[]) || []).filter(Boolean)));
    const colors = Array.from(new Set((vars || []).map((v) => v.color_name).filter(Boolean)));
    const sizes = Array.from(new Set((vars || []).map((v) => v.size).filter(Boolean)));

    res.status(200).json({
      success: true,
      data: {
        categories,
        collections,
        colors,
        sizes,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch filters';
    res.status(500).json({ success: false, message });
  }
};
