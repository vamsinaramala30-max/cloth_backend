export interface ICollection {
  _id?: string;
  id?: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  image: string;
  bannerImage?: string;
  accentColor?: string;
  featuredProducts: string[];
  productCount: number;
  displayOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}
