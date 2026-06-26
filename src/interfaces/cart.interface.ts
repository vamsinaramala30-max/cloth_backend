import type { Document, Model, Types } from 'mongoose';

export interface ICartItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantSku?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartMethods {
  getTotal(): number;
}

export type ICartDocument = ICart & ICartMethods & Document;
export type ICartModel = Model<ICart, Record<string, never>, ICartMethods>;
