import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter';
import { CreateProductInput, UpdateProductInput } from '../utils/validators';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, sort, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sort === 'price_asc') orderBy.price = 'asc';
    else if (sort === 'price_desc') orderBy.price = 'desc';
    else if (sort === 'newest') orderBy.createdAt = 'desc';
    else orderBy.createdAt = 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    paginatedResponse(res, products, total, pageNum, limitNum, 'Products fetched successfully', 200, 'products');
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      errorResponse(res, 'NotFoundError', `Product with id ${id} not found`, 404);
      return;
    }

    successResponse(res, product, 'Product fetched successfully');
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data: CreateProductInput = req.body;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        imageUrl: data.imageUrl,
      },
    });

    successResponse(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      errorResponse(res, 'ConflictError', `Product name '${req.body.name}' already exists`, 409);
    } else {
      errorResponse(res, 'InternalServerError', error.message, 500);
    }
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateProductInput = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });

    successResponse(res, product, 'Product updated successfully');
  } catch (error: any) {
    if (error.code === 'P2025') {
      errorResponse(res, 'NotFoundError', `Product with id ${req.params.id} not found`, 404);
    } else if (error.code === 'P2002') {
      errorResponse(res, 'ConflictError', `Product name already exists`, 409);
    } else {
      errorResponse(res, 'InternalServerError', error.message, 500);
    }
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Check if product has any orders
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: parseInt(id) },
    });

    if (orderItemCount > 0) {
      errorResponse(
        res,
        'ConflictError',
        `Cannot delete product that has ${orderItemCount} existing order(s)`,
        409
      );
      return;
    }

    const product = await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    successResponse(res, product, 'Product deleted successfully');
  } catch (error: any) {
    if (error.code === 'P2025') {
      errorResponse(res, 'NotFoundError', `Product with id ${id} not found`, 404);
    } else {
      errorResponse(res, 'InternalServerError', error.message, 500);
    }
  }
};
