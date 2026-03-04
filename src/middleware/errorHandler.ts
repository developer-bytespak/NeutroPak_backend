import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseFormatter';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    // Unique constraint failed
    const field = err.meta?.target?.[0] || 'field';
    errorResponse(res, 'ConflictError', `${field} already exists`, 409);
    return;
  }

  if (err.code === 'P2025') {
    // Record not found
    errorResponse(res, 'NotFoundError', 'Record not found', 404);
    return;
  }

  if (err.code === 'P2003') {
    // Foreign key constraint failed
    errorResponse(res, 'ConflictError', 'Related records exist or invalid reference', 409);
    return;
  }

  // Validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.reduce((acc: any, error: any) => {
      acc[error.path.join('.')] = error.message;
      return acc;
    }, {});
    errorResponse(res, 'ValidationError', 'Request validation failed', 400, details);
    return;
  }

  // Default error
  errorResponse(
    res,
    'InternalServerError',
    err.message || 'An unexpected error occurred',
    err.statusCode || 500
  );
};
