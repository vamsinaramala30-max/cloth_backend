import type { Response } from 'express';
import type { Pagination } from '../types/index';

/**
 * Send a successful JSON response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { message?: string; statusCode?: number; pagination?: Pagination } = {},
): void {
  const { message, statusCode = 200, pagination } = options;
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(pagination && { pagination }),
    data,
  });
}

/**
 * Send an error JSON response.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Array<{ field: string | number; message: string }>,
): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}
