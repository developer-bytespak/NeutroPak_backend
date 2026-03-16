import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter';
import { CreateOrderInput, UpdateOrderStatusInput } from '../utils/validators';
import { sendOrderStatusEmail, sendOrderConfirmationEmail } from '../services/emailService';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const data: CreateOrderInput = req.body;

    // Check if all products exist and have sufficient stock
    const productIds = data.orderItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== data.orderItems.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      errorResponse(
        res,
        'ProductNotFoundError',
        'One or more products in the order do not exist',
        400,
        { productIds: missingIds }
      );
      return;
    }

    // Check stock availability
    const stockIssues: any[] = [];
    for (const item of data.orderItems) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        stockIssues.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
        });
      }
    }

    if (stockIssues.length > 0) {
      errorResponse(
        res,
        'InsufficientStockError',
        'Cannot place order - insufficient stock',
        400,
        stockIssues
      );
      return;
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const orderData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        shippingMethod: data.shippingMethod || 'standard',
        shippingCost: data.shippingCost,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        status: 'PENDING',
      };

      // Only include country and state if they have values
      if (data.country) {
        orderData.country = data.country;
      }
      if (data.state) {
        orderData.state = data.state;
      }

      const newOrder = await tx.order.create({
        data: orderData,
      });

      // Create order items
      for (const item of data.orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Decrease product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: data.total,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
        },
      });

      return newOrder;
    });

    const orderNo = `ORD-2026-${String(order.id).padStart(6, '0')}`;

    // Fetch order items for confirmation email
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: true },
    });

    // Send order confirmation email
    try {
      const emailItems = orderItems.map((item) => ({
        name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : item.price,
      }));
      const totalAmount = typeof order.total === 'object' ? parseFloat(order.total.toString()) : order.total;
      await sendOrderConfirmationEmail(
        order.email,
        order.id,
        orderNo,
        order.firstName,
        emailItems,
        totalAmount
      );
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    successResponse(
      res,
      {
        id: order.id,
        orderNo,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
      'Order placed successfully. Payment will be collected on delivery.',
      201
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
        payment: true,
      },
    });

    if (!order) {
      errorResponse(res, 'NotFoundError', `Order with id ${id} not found`, 404);
      return;
    }

    // Email verification if provided
    if (email && order.email !== email) {
      errorResponse(res, 'EmailMismatchError', 'The provided email does not match the order email', 400);
      return;
    }

    const orderNo = `ORD-2026-${String(order.id).padStart(6, '0')}`;

    successResponse(res, { ...order, orderNo }, 'Order fetched successfully');
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const listOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, email, startDate, endDate } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (email) where.email = { contains: email as string, mode: 'insensitive' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { product: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    const ordersWithOrderNo = orders.map((order) => ({
      ...order,
      orderNo: `ORD-2026-${String(order.id).padStart(6, '0')}`,
      itemCount: order.orderItems.length,
    }));

    paginatedResponse(res, ordersWithOrderNo, total, pageNum, limitNum, 'Orders fetched successfully', 200, 'orders');
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status }: UpdateOrderStatusInput = req.body;

    // Fetch the order with its details and items before updating
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!existingOrder) {
      errorResponse(res, 'NotFoundError', `Order with id ${id} not found`, 404);
      return;
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    const orderNo = `ORD-2026-${String(order.id).padStart(6, '0')}`;

    // Send order status update email with full order details
    try {
      // Format order items for email
      const items = order.orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price.toNumber() * item.quantity,
      }));

      // Prepare shipping address details
      const orderDetails = {
        firstName: order.firstName,
        lastName: order.lastName,
        address: order.address,
        city: order.city,
        state: order.state,
        postalCode: order.postalCode,
        country: order.country,
      };

      await sendOrderStatusEmail(
        order.email,
        order.id,
        orderNo,
        order.firstName,
        status,
        items,
        order.total.toNumber(),
        orderDetails
      );
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError);
      // Don't fail the status update if email fails
    }

    successResponse(res, { ...order, orderNo }, `Order status updated to ${status}`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      errorResponse(res, 'NotFoundError', `Order with id ${req.params.id} not found`, 404);
    } else {
      errorResponse(res, 'InternalServerError', error.message, 500);
    }
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    // Get the order first
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      errorResponse(res, 'NotFoundError', `Order with id ${id} not found`, 404);
      return;
    }

    // Only allow deletion of PENDING orders
    if (order.status !== 'PENDING') {
      errorResponse(
        res,
        'ConflictError',
        `Cannot delete order with status ${order.status}. Only PENDING orders can be deleted.`,
        409
      );
      return;
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Return stock for all items
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Delete payment
      await tx.payment.deleteMany({
        where: { orderId: orderId },
      });

      // Delete order items
      await tx.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      // Delete order
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    const orderNo = `ORD-2026-${String(order.id).padStart(6, '0')}`;

    successResponse(
      res,
      { id: order.id, orderNo },
      'Order deleted successfully. Stock has been refunded.'
    );
  } catch (error: any) {
    if (error.code === 'P2025') {
      errorResponse(res, 'NotFoundError', `Order with id ${req.params.id} not found`, 404);
    } else {
      errorResponse(res, 'InternalServerError', error.message, 500);
    }
  }
};
