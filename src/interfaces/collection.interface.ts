import type { Document, Model, Types } from 'mongoose';

export interface ICollection {
  name: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  image: string;
  bannerImage?: string;
  accentColor?: string;
  featuredProducts: Types.ObjectId[];
  productCount: number;
  displayOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollectionMethods {
  // Add custom instance methods if needed
}

export type ICollectionDocument = ICollection & ICollectionMethods & Document;
export type ICollectionModel = Model<ICollection, Record<string, never>, ICollectionMethods>;
