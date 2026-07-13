import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Envuelve un controller async para que cualquier excepción/rechazo se
 * propague a next(err) y lo capture el errorHandler centralizado.
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
