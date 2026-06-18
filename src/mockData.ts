/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Branch, Category, Product } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    username: 'owner',
    fullname: 'Pratama Adi (Owner)',
    email: 'owner@nusapos.com',
    role: 'Owner',
    isActive: true,
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'user-2',
    username: 'manager_miko',
    fullname: 'Miko Rahardjo',
    email: 'miko@nusapos.com',
    role: 'Manager',
    isActive: true,
    createdAt: '2026-06-05T09:00:00Z'
  },
  {
    id: 'user-3',
    username: 'admin_toko',
    fullname: 'Siti Aminah',
    email: 'siti@nusapos.com',
    role: 'Admin Toko',
    isActive: true,
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'user-4',
    username: 'kasir_doni',
    fullname: 'Doni Setiawan',
    email: 'doni@nusapos.com',
    role: 'Kasir',
    isActive: true,
    createdAt: '2026-06-15T07:30:00Z'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'nusaPOS - Jakarta Kemang',
    address: 'Jl. Kemang Raya No. 12A, Bangka, Mampang Prapatan, Jakarta Selatan 12730',
    phone: '0812-3456-7890',
    isActive: true,
    isMainBranch: true
  },
  {
    id: 'branch-2',
    name: 'nusaPOS - Bandung Dago',
    address: 'Jl. Ir. H. Juanda No. 102, Lebakgede, Kec. Coblong, Kota Bandung 40132',
    phone: '0812-7654-3210',
    isActive: true
  },
  {
    id: 'branch-3',
    name: 'nusaPOS - Surabaya Gubeng',
    address: 'Jl. Dharmahusada Indah No. 54, Mojo, Kec. Gubeng, Surabaya 60115',
    phone: '0813-9876-5432',
    isActive: true
  },
  {
    id: 'branch-4',
    name: 'nusaPOS - Yogyakarta Malioboro',
    address: 'Jl. Margoutomo No. 22, Sosromenduran, Gedong Tengen, Kota Yogyakarta 55271',
    phone: '0811-2233-4455',
    isActive: true
  },
  {
    id: 'branch-5',
    name: 'nusaPOS - Medan Merdeka',
    address: 'Jl. Balai Kota No. 4, Kesawan, Kec. Medan Barat, Kota Medan 20111',
    phone: '0852-6677-8899',
    isActive: true
  },
  {
    id: 'branch-6',
    name: 'nusaPOS - Bali Seminyak',
    address: 'Jl. Kayu Aya No. 9, Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361',
    phone: '0819-5566-7788',
    isActive: true
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Makanan Utama', isActive: true, createdAt: '2026-06-01T08:00:00Z' },
  { id: 'cat-2', name: 'Minuman Dingin', isActive: true, createdAt: '2026-06-01T08:05:00Z' },
  { id: 'cat-3', name: 'Kopi Spesial', isActive: true, createdAt: '2026-06-01T08:10:00Z' },
  { id: 'cat-4', name: 'Camilan / Dessert', isActive: true, createdAt: '2026-06-01T08:15:00Z' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Nasi Goreng Nusa Spesial',
    categoryId: 'cat-1',
    price: 32000,
    stock: 25,
    sku: 'NNS-001',
    isActive: true,
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'prod-2',
    name: 'Ayam Geprek Sambal Korek',
    categoryId: 'cat-1',
    price: 26000,
    stock: 30,
    sku: 'AGK-002',
    isActive: true,
    createdAt: '2026-06-01T09:05:00Z'
  },
  {
    id: 'prod-3',
    name: 'Mie Goreng Nyemek Jawa',
    categoryId: 'cat-1',
    price: 24000,
    stock: 20,
    sku: 'MNJ-003',
    isActive: true,
    createdAt: '2026-06-01T09:10:00Z'
  },
  {
    id: 'prod-4',
    name: 'Es Kopi Susu Gula Aren',
    categoryId: 'cat-3',
    price: 18000,
    stock: 85,
    sku: 'KSA-004',
    isActive: true,
    createdAt: '2026-06-01T09:15:00Z'
  },
  {
    id: 'prod-5',
    name: 'Caramel Macchiato Ice',
    categoryId: 'cat-3',
    price: 28000,
    stock: 40,
    sku: 'CMI-005',
    isActive: true,
    createdAt: '2026-06-01T09:20:00Z'
  },
  {
    id: 'prod-6',
    name: 'Teh Tarik Madu Dingin',
    categoryId: 'cat-2',
    price: 15000,
    stock: 60,
    sku: 'TTD-006',
    isActive: true,
    createdAt: '2026-06-01T09:25:00Z'
  },
  {
    id: 'prod-7',
    name: 'Matcha Latte Premium',
    categoryId: 'cat-2',
    price: 22000,
    stock: 45,
    sku: 'MLP-007',
    isActive: true,
    createdAt: '2026-06-01T09:30:00Z'
  },
  {
    id: 'prod-8',
    name: 'Roti Bakar Cokelat Keju',
    categoryId: 'cat-4',
    price: 17000,
    stock: 15,
    sku: 'RBK-008',
    isActive: true,
    createdAt: '2026-06-01T09:35:00Z'
  },
  {
    id: 'prod-9',
    name: 'Croissant Almond Warm',
    categoryId: 'cat-4',
    price: 25000,
    stock: 12,
    sku: 'CAW-009',
    isActive: true,
    createdAt: '2026-06-01T09:40:00Z'
  },
  {
    id: 'prod-10',
    name: 'Pisang Goreng Madu Krispi',
    categoryId: 'cat-4',
    price: 16000,
    stock: 22,
    sku: 'PGM-010',
    isActive: true,
    createdAt: '2026-06-01T09:45:00Z'
  }
];

// Elegant default QRIS vector representing a connected account
// We will generate an embedded SVG string since we are forbidden from using external broken images.
export const DEFAULT_QRIS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" fill="#ffffff" rx="16"/>
  <!-- Border -->
  <rect x="15" y="15" width="370" height="370" rx="12" fill="none" stroke="#10b981" stroke-width="4"/>
  
  <!-- Header Text -->
  <text x="50%" y="45" font-family="'Outfit', sans-serif" font-weight="bold" font-size="20" fill="#0f172a" text-anchor="middle">QRIS - nusaPOS Cloud</text>
  <text x="50%" y="65" font-family="Inter, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">ID ACCT: ID1020084555000</text>
  
  <!-- Outer QR box alignment markers -->
  <!-- Top Left -->
  <rect x="80" y="100" width="45" height="45" fill="#0f172a"/>
  <rect x="90" y="110" width="25" height="25" fill="#ffffff"/>
  <rect x="97" y="117" width="11" height="11" fill="#10b981"/>
  
  <!-- Top Right -->
  <rect x="275" y="100" width="45" height="45" fill="#0f172a"/>
  <rect x="285" y="110" width="25" height="25" fill="#ffffff"/>
  <rect x="292" y="117" width="11" height="11" fill="#10b981"/>
  
  <!-- Bottom Left -->
  <rect x="80" y="255" width="45" height="45" fill="#0f172a"/>
  <rect x="90" y="265" width="25" height="25" fill="#ffffff"/>
  <rect x="97" y="272" width="11" height="11" fill="#10b981"/>
  
  <!-- QR Pattern Mockup -->
  <!-- Random horizontal & vertical blocks for realistic QR code look -->
  <path d="M 140,100 H 160 V 120 H 140 Z M 180,100 H 210 V 110 H 180 Z M 230,100 H 250 V 120 H 230 Z M 165,115 H 175 V 145 H 165 Z" fill="#0f172a"/>
  <path d="M 215,120 H 225 V 150 H 215 Z M 135,135 H 155 V 160 H 135 Z M 185,130 H 205 V 140 H 185 Z M 240,125 H 265 V 145 H 240 Z" fill="#0f172a"/>
  <path d="M 140,170 H 180 V 180 H 140 Z M 195,155 H 210 V 185 H 195 Z M 220,160 H 250 V 170 H 220 Z M 260,150 H 270 V 190 H 260 Z" fill="#0f172a"/>
  <path d="M 80,160 H 105 V 170 H 80 Z M 115,160 H 125 V 195 H 115 Z M 110,210 H 145 V 220 H 110 Z M 80,190 H 100 V 205 H 80 Z" fill="#0f172a"/>
  <path d="M 275,190 H 320 V 200 H 275 Z M 290,210 H 300 V 235 H 290 Z M 310,215 H 320 V 245 H 310 Z M 275,215 H 285 V 230 H 275 Z" fill="#0f172a"/>
  
  <!-- Bottom QR Pattern -->
  <path d="M 140,255 H 155 V 280 H 140 Z M 170,250 H 200 V 260 H 170 Z M 215,255 H 230 V 285 H 215 Z M 240,250 H 260 V 265 H 240 Z" fill="#0f172a"/>
  <path d="M 150,290 H 190 V 300 H 150 Z M 200,285 H 215 V 315 H 200 Z M 230,295 H 265 V 305 H 230 Z M 250,275 H 270 V 290 H 250 Z" fill="#0f172a"/>
  <path d="M 140,310 H 160 V 330 H 140 Z M 180,310 H 215 V 320 H 180 Z M 225,315 H 240 V 330 H 225 Z M 250,310 H 260 V 330 H 250 Z" fill="#0f172a"/>
  <path d="M 80,315 H 100 V 330 H 80 Z M 110,310 H 125 V 330 H 110 Z M 290,255 H 310 V 275 H 290 Z M 280,290 H 315 V 300 H 280 Z" fill="#0f172a"/>
  
  <!-- Beautiful Center Logo Card -->
  <rect x="165" y="165" width="70" height="70" rx="8" fill="#10b981" stroke="#ffffff" stroke-width="4"/>
  <text x="200" y="200" font-family="'Outfit', sans-serif" font-weight="800" font-size="16" fill="#ffffff" text-anchor="middle">nusa</text>
  <text x="200" y="215" font-family="'Outfit', sans-serif" font-weight="400" font-size="11" fill="#e2fbf0" text-anchor="middle">POS</text>
  
  <!-- Footer bank info -->
  <rect x="40" y="340" width="320" height="42" rx="8" fill="#f8fafc"/>
  <text x="200" y="357" font-family="Inter, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">TERHUBUNG DENGAN REKENING UTAMA BNI</text>
  <text x="200" y="373" font-family="Inter, sans-serif" font-weight="600" font-size="11" fill="#0f172a" text-anchor="middle">PT NUSANTARA SUKSES SEJAHTERA (HQ)</text>
</svg>
`;
