import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter';
import { UpdatePaymentInput } from '../utils/validators';

export const listPayments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, paymentStatus, startDate, endDate } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              email: true,
              phone: true,
              city: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.payment.count({ where }),
    ]);

    const enrichedPayments = payments.map((payment) => ({
      ...payment,
      order: {
        ...payment.order,
        orderNo: `ORD-2026-${String(payment.order.id).padStart(6, '0')}`,
      },
    }));

    paginatedResponse(res, enrichedPayments, total, pageNum, limitNum, 'Payments fetched successfully', 200, 'payments');
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            orderItems: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!payment) {
      errorResponse(res, 'NotFoundError', `Payment with id ${id} not found`, 404);
      return;
    }

    const enriched = {
      ...payment,
      order: {
        ...payment.order,
        orderNo: `ORD-2026-${String(payment.order.id).padStart(6, '0')}`,
      },
    };

    successResponse(res, enriched, 'Payment fetched successfully');
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const markPaymentCollected = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus }: UpdatePaymentInput = req.body;

    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: parseInt(id) },
        data: {
          paymentStatus,
          collectedAt: paymentStatus === 'COMPLETED' ? new Date() : null,
        },
      });

      // If payment is marked as COMPLETED, optionally update order status to DELIVERED
      if (paymentStatus === 'COMPLETED') {
        await tx.order.update({
          where: { id: updatedPayment.orderId },
          data: { status: 'DELIVERED' },
        });
      }

      return updatedPayment;
    });

    successResponse(res, payment, 'Payment marked as collected successfully');
  } catch (error: any) {
    if (error.code === 'P2025') {
      errorResponse(res, 'NotFoundError', `Payment with id ${req.params.id} not found`, 404);
    } else {
      errorResponse(res, 'InternalServerError', error.message, 500);
    }
  }
};
