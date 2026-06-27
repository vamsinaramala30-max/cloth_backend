export interface IProductVariant {
  sku: string;
  color: string;
  colorName: string;
  size: string;
  stock: number;
  images: string[];
}

export interface IProduct {
  _id?: string;
  id?: string;
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
