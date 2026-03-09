import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/responseFormatter';

export const validateRequest = (schema: ZodSchema, source: 'body' | 'query' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = source === 'query' ? req.query : req.body;
      const validated = await schema.parseAsync(dataToValidate);
      
      if (source === 'query') {
        (req as any).query = validated as any;
      } else {
        req.body = validated;
      }
      
      next();
    } catch (error: any) {
      console.error('=== VALIDATION ERROR ===');
      console.error(`Request ${source}:`, JSON.stringify(source === 'query' ? req.query : req.body, null, 2));
      
      if (error.name === 'ZodError') {
        const details: any = {};
        
        if (Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            const fieldPath = err.path && Array.isArray(err.path) ? err.path.join('.') : 'unknown';
            details[fieldPath] = err.message;
          });
        }
        
        console.error('Validation details:', details);
        errorResponse(res, 'ValidationError', `${source} validation failed`, 400, details);
      } else {
        console.error('Non-validation error:', error);
        errorResponse(res, 'ValidationError', error.message || 'Invalid request', 400);
      }
    }
  };
};
