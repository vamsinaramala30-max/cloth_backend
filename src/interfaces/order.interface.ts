export interface IOrderItem {
  product: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  color: string;
  size: string;
  image: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IPaymentInfo {
  gateway: 'stripe' | 'razorpay';
  paymentId: string;
  orderId?: string;
  status: 'pending' | 'paid' | 'failed';
}

export interface IFinancials {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface IOrder {
  _id?: string;
  id?: string;
  user: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  financials: IFinancials;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
}
