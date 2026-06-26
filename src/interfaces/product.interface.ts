import type { Document, Model } from 'mongoose';

export interface IProductVariant {
  sku: string;
  color: string;
  colorName: string;
  size: string;
  stock: number;
  images: string[];
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  category: string;
  collections: string[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  popularity?: number;
  variants: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductMethods {
  // custom methods can be added here
}

export type IProductDocument = IProduct & IProductMethods & Document;
export type IProductModel = Model<IProduct, Record<string, never>, IProductMethods>;
