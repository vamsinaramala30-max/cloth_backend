// Type declarations for packages without official @types
declare module 'xss-clean' {
  import type { RequestHandler } from 'express';
  function xssClean(): RequestHandler;
  export = xssClean;
}
