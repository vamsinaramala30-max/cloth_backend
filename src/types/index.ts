// Barrel export for all shared types and interfaces
export type { JwtPayload, AuthTokens, CookieOptions } from '../interfaces/auth.interface';
export type { IUser, IUserMethods, IUserModel } from '../interfaces/user.interface';
export type { IProduct, IProductVariant, IProductMethods } from '../interfaces/product.interface';
export type { ICart, ICartItem, ICartMethods } from '../interfaces/cart.interface';
export type { IOrder, IOrderItem, IShippingAddress, IPaymentInfo, IFinancials } from '../interfaces/order.interface';

// Pagination
export interface Pagination {
  total: number;
  page?: number;
  pages?: number;
  limit?: number;
}

// Standard API Response shape
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string | number; message: string }>;
  pagination?: Pagination;
}

// User roles enum
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

// Payment gateway enum
export enum PaymentGateway {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
}

// Product size enum
export enum ProductSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}
