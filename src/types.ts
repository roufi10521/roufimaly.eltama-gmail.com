/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Owner' | 'Manager' | 'Admin Toko' | 'Kasir';

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  isMainBranch?: boolean;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  image?: string; // Optional URL/base64
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  paymentMethod: 'Tunai' | 'QRIS';
  totalAmount: number;
  cashPaid: number;
  changeAmount: number;
  qrisImageUrl?: string;
}
