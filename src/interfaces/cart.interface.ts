export interface ICartItem {
  _id?: string;
  id?: string;
  productId: string;
  variantSku?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface ICart {
  _id?: string;
  id?: string;
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}
