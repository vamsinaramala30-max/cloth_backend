import type { JwtPayload } from '../interfaces/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
