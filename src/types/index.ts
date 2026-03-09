export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string | null;
  state?: string | null;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderItems?: OrderItem[];
  payment?: Payment;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'COMPLETED';
  collectedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  state?: string;
  shippingMethod?: string;
  orderItems: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  details?: any;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
