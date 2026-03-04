import { z } from 'zod';

// Product Validators
export const CreateProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  price: z.number().min(0).max(999999),
  category: z.string().min(2).max(50),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional().nullable(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Order Validators
export const CreateOrderSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(30),
  country: z.union([z.string(), z.null()]).optional(),
  state: z.union([z.string(), z.null()]).optional(),
  shippingMethod: z.string().optional(),
  orderItems: z.array(
    z.object({
      productId: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().min(1),
      price: z.coerce.number().min(0),
    })
  ).min(1),
  subtotal: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
  paymentMethod: z.string().min(1),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// Payment Validators
export const UpdatePaymentSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'COMPLETED']),
});

// Auth Validators
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// Query Validators
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const ProductQuerySchema = PaginationSchema.extend({
  category: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  search: z.string().optional(),
});

export const OrderQuerySchema = PaginationSchema.extend({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  email: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const PaymentQuerySchema = PaginationSchema.extend({
  paymentStatus: z.enum(['PENDING', 'COMPLETED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type exports for easier usage
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
