import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    statusCode,
  } as ApiResponse<T>);
};

export const errorResponse = (
  res: Response,
  error: string,
  message: string = error,
  statusCode: number = 400,
  details?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
    statusCode,
    ...(details && { details }),
  } as ApiResponse);
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Fetched successfully',
  statusCode: number = 200,
  dataKey: string = 'data'
): Response => {
  const totalPages = Math.ceil(total / limit);
  return res.status(statusCode).json({
    success: true,
    data: {
      [dataKey]: data,
      total,
      page,
      totalPages,
    },
    message,
    statusCode,
  });
};
