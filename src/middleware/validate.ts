import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Validate request.body against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export const validateBody =
  (schema: ZodSchema): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors.map((err) => ({
            field: err.path[0] ?? 'unknown',
            message: err.message,
          })),
        });
        return;
      }
      res.status(500).json({ success: false, message: 'Validation internal anomaly.' });
    }
  };
