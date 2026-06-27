// JWT payload attached to req.user after authentication
export interface JwtPayload {
  /** Supabase user UUID */
  id: string;
  /** User role */
  role: string;
  /** JWT standard fields */
  iat?: number;
  exp?: number;
}

// Tokens returned by auth flow
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

// Cookie options
export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
}
