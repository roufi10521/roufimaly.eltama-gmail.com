/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Branch, Category, Product, CartItem, Transaction } from '../types';
import { 
  Search, ShoppingCart, CreditCard, Banknote, Trash2, Check, X, 
  MapPin, UserCheck, Receipt, ArrowRight, Upload, Sparkles, Image as ImageIcon,
  CheckCircle2, AlertTriangle, ArrowLeftRight
} from 'lucide-react';
import { formatRupiah, generateInvoiceNumber, formatDateString } from '../utils';

interface CashierPanelProps {
  currentUser: User;
  branches: Branch[];
  categories: Category[];
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  onRecordTransaction: (tx: Transaction) => void;
  qrisImage: string;
  onUpdateQrisImage: (imageBlob: string) => void;
  activeBranchId: string;
  onChangeActiveBranchId: (id: string) => void;
}

export default function CashierPanel({
  currentUser,
  branches,
  categories,
  products,
  onUpdateProducts,
  onRecordTransaction,
  qrisImage,
  onUpdateQrisImage,
  activeBranchId,
  onChangeActiveBranchId
}: CashierPanelProps) {

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // Search and Category filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Payment states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS'>('Tunai');
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [checkoutError, setCheckoutError] = useState('');

  // Finished Invoice modal state
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  // Drag and drop or File Select for QRIS state
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // --- CART HANDLERS ---
  const handleAddToCart = (product: Product) => {
    // Check stock
    const cartItem = cart.find((item) => item.product.id === product.id);
    const existingQty = cartItem ? cartItem.quantity : 0;

    if (product.stock <= existingQty) {
      alert(`Stok produk "${product.name}" terbatas! Hanya tersedia ${product.stock} unit.`);
      return;
    }

    if (cartItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const matched = cart.find((item) => item.product.id === productId);
    if (!matched) return;

    const newQty = matched.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
      return;
    }

    // Check inventory stock limits
    if (delta > 0 && matched.product.stock <= matched.quantity) {
      alert(`Gagal menambah kuantitas! Stok maksimal sebesar ${matched.product.stock} telah tercapai.`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.1); // PPN 10%
  const totalAmount = subtotal + taxAmount;
  const changeAmount = paymentMethod === 'Tunai' ? Math.max(0, cashPaid - totalAmount) : 0;

  // --- QRIS UPLOAD (REQUIREMENT 2: Upload QRIS terhubung rekening) ---
  const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateQrisImage(reader.result);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- START CHECKOUT ---
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError('');
    setCashPaid(totalAmount); // default set to avoid empty value
    setPaymentMethod('Tunai');
    setIsCheckoutOpen(true);
  };

  const handleProcessCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (paymentMethod === 'Tunai' && cashPaid < totalAmount) {
      setCheckoutError(`Maaf, nominal tunai yang diinput (${formatRupiah(cashPaid)}) kurang dari total tagihan (${formatRupiah(totalAmount)}).`);
      return;
    }

    // 1. Generate Invoice object
    const invoiceNo = generateInvoiceNumber('NP');
    
    // 2. Map items
    const txItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: invoiceNo,
      timestamp: new Date().toISOString(),
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      cashierId: currentUser.id,
      cashierName: currentUser.fullname,
      items: txItems,
      paymentMethod: paymentMethod,
      totalAmount: totalAmount,
      cashPaid: paymentMethod === 'Tunai' ? cashPaid : totalAmount,
      changeAmount: paymentMethod === 'Tunai' ? changeAmount : 0,
      qrisImageUrl: paymentMethod === 'QRIS' ? qrisImage : undefined
    };

    // 3. Update stock quantities in parent state (Requirement 5: Update product stocks)
    const updatedProducts = products.map((prod) => {
      const cartMatched = cart.find((item) => item.product.id === prod.id);
      if (cartMatched) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartMatched.quantity)
        };
      }
      return prod;
    });

    onUpdateProducts(updatedProducts);
    onRecordTransaction(newTx);
    
    // Save invoice to show user receipt ticket
    setLastTx(newTx);

    // Reset workflow
    setCart([]);
    setIsCheckoutOpen(false);
  };

  // Filter products strictly based on search & category values
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCatId === 'all' || prod.categoryId === selectedCatId;
    
    return prod.isActive && matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* LEFT & CENTER PARTS: SEARCH, CATEGORIES, AND PRODUCT CATALOG GRID */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Branch Context HUD */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sesi Cabang Ritel Aktif</span>
              <span className="text-xs font-bold text-slate-800">{activeBranch.name}</span>
            </div>
          </div>

          {/* Quick Active Branch Selector (Requirement 3: "Tambah banyak lagi... edit... pilih") */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden md:inline">Ganti Cabang:</div>
            <select
              value={activeBranchId}
              onChange={(e) => onChangeActiveBranchId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer w-full sm:w-auto"
            >
              {branches.filter(b => b.isActive).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar and Categories Gilded bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari item kasir berdasarkan nama produk atau barkode SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs">
                Keluarkan
              </button>
            )}
          </div>

          {/* Categories Tab Grid */}
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                selectedCatId === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Semua Menu ({products.filter(p => p.isActive).length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id && p.isActive).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                    selectedCatId === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Catalog Grid (Requirement 6: visual terlihat jelas) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const inCart = cart.find((item) => item.product.id === prod.id);
            const inCartQty = inCart ? inCart.quantity : 0;
            const isOutOfStock = prod.stock === 0;
            const isLowStock = prod.stock > 0 && prod.stock <= 5;

            return (
              <div
                key={prod.id}
                onClick={() => !isOutOfStock && handleAddToCart(prod)}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all duration-200 relative group cursor-pointer ${
                  isOutOfStock 
                    ? 'opacity-40 border-slate-100 cursor-not-allowed bg-slate-50' 
                    : 'border-slate-150 hover:ring-2 hover:ring-emerald-500 hover:shadow-md'
                }`}
              >
                {/* Visual Quantities Alerts & Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                  {inCartQty > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono rounded-full text-[10px] font-bold shadow-md animate-bounce">
                      {inCartQty}x
                    </span>
                  )}
                  {isOutOfStock ? (
                    <span className="px-2 py-0.5 bg-red-150 text-red-700 font-bold font-mono text-[8.5px] rounded border border-red-200 uppercase tracking-wider">
                      Habis
                    </span>
                  ) : isLowStock ? (
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-[8.5px] rounded border border-amber-200">
                      Stok {prod.stock}
                    </span>
                  ) : null}
                </div>

                 <div className="flex flex-col items-center gap-3 mt-1.5 text-center w-full">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full aspect-[4/7] rounded-xl object-cover bg-slate-50 border border-slate-150 group-hover:scale-102 transition-all shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full aspect-[4/7] rounded-xl bg-slate-50 border border-slate-150 text-slate-450 flex flex-col items-center justify-center font-display uppercase group-hover:scale-102 transition-all shrink-0 shadow-inner gap-2">
                      <span className="font-black text-4xl text-slate-350">{prod.name.charAt(0)}</span>
                      <span className="text-[10px] text-slate-400 tracking-wider font-semibold font-sans px-2 truncate max-w-full">No Image</span>
                    </div>
                  )}
                  <div className="w-full">
                    <h4 className="font-display font-extrabold text-[13px] text-slate-800 line-clamp-2 leading-tight tracking-tight group-hover:text-emerald-700 transition min-h-[2.5rem] flex items-center justify-center px-1">
                      {prod.name}
                    </h4>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="font-mono font-bold text-[13px] text-slate-800">
                    {formatRupiah(prod.price)}
                  </span>
                  {!isOutOfStock && (
                    <span className="text-[10px] font-bold font-display text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Tambah
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Katalog Kosong / Tidak Cocok</p>
              <p className="text-[11px] text-slate-400 mt-1">Ganti filter kategori atau ubah pencarian kata kunci Anda.</p>
            </div>
          )}
        </div>

        {/* INTEGRATION SETTINGS PANEL (DEDICATED FOR OWNER/ADMIN) - REQUIREMENT 2: Upload QRIS */}
        {currentUser.role !== 'Kasir' && (
          <div className="bg-emerald-950/95 border border-emerald-800 p-6 rounded-2xl text-white space-y-4 shadow-lg overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-10"></div>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  Konfigurasi Channel Pembayaran QRIS (Ritel Cloud)
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                  Buku kasir nusaPOS cloud terhubung dengan QRIS dinamis Anda. Unggah QRIS yang sudah terintegrasi dengan kode QR bank Anda (BNI, BCA, BRI, Mandiri, Ovo, Gopay) di bawah ini sehingga kasir dapat memajangnya seketika saat pembeli memilih metode bayar QRIS.
                </p>
              </div>

              {/* Instant QRIS Preview thumbnail */}
              <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-emerald-800 shadow-xl">
                {qrisImage.startsWith('<svg') ? (
                  <div className="w-full h-full scale-105" dangerouslySetInnerHTML={{ __html: qrisImage }} />
                ) : (
                  <img src={qrisImage} alt="QRIS Aktif" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                )}
              </div>
            </div>

            {/* Drag & Drop File Selector area style */}
            <div className="relative border-b-0.5 border-dashed border-emerald-800 pt-3"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-200 block uppercase tracking-wide">
                  Ganti Gambar QRIS Transaksi Hubung Rekening:
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center justify-center gap-2 p-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold duration-150 cursor-pointer shadow-md">
                    <Upload className="w-3.5 h-3.5 text-emerald-250" />
                    <span>Pilih Berkas QRIS (.PNG / .JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrisFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-300">Format: File Foto / Tangkapan Layar QRIS Bank</span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex md:justify-end">
                {uploadSuccess ? (
                  <div className="p-2 px-3 bg-emerald-900 border border-emerald-700 text-emerald-300 text-[10px] rounded-lg font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Upload Sukses! QRIS Auto Terhubung Cloud</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-emerald-300/80 italic text-left md:text-right">
                    * QRIS default terhubung Rekening nusaPOS Utama BNI (08XX-XXXX-XXX).
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* RIGHT PART: THE POS ACTIVE CART (Requirement 6: visual terlihat jelas) */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col max-h-[85vh] sticky top-4 overflow-hidden">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
            <span className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" /> Keranjang Belanja ({cart.reduce((a,c) => a + c.quantity, 0)})
            </span>
            {cart.length > 0 && (
              <button
                _id="btn-clear-cart"
                onClick={handleClearCart}
                className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer duration-150"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px]">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex-1 space-y-0.5">
                  <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{item.product.name}</h5>
                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span className="text-slate-400">@ {formatRupiah(item.product.price)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-600 font-extrabold">Sub: {formatRupiah(item.product.price * item.quantity)}</span>
                  </div>
                </div>

                {/* Micro Qty adjust controller */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleUpdateCartQty(item.product.id, -1)}
                    className="w-6 h-6 bg-white border border-slate-205 rounded-md text-xs font-bold font-mono text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold font-mono text-slate-800 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateCartQty(item.product.id, 1)}
                    className="w-6 h-6 bg-white border border-slate-205 rounded-md text-xs font-bold font-mono text-slate-500 hover:bg-slate-100 hover:text-slate-705 cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className="text-slate-300 hover:text-red-500 p-0.5 cursor-pointer duration-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-12 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 font-display font-medium text-xs">Keranjang masih kosong.</p>
                <p className="text-[10px] text-slate-350 mt-1">Klik item dari katalog produk di sebelah kiri.</p>
              </div>
            )}
          </div>

          {/* Pricing Totals Bracket */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-mono text-slate-700">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN Pajak (10%)</span>
                <span className="font-mono text-slate-700">{formatRupiah(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1.5 text-sm">
                <span>Total Belanja</span>
                <span className="font-mono text-emerald-700">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="btn-checkout-trigger"
              disabled={cart.length === 0}
              onClick={handleOpenCheckout}
              className={`w-full py-3 px-4 font-display font-bold text-white uppercase rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
                cart.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer hover:shadow-md'
                  : 'bg-slate-250 text-slate-400 cursor-not-allowed'
              }`}
            >
              Bayar Sekarang
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </div>

        </div>
      </div>

      {/* ================= MODAL 1: CHECKOUT POPUP WITH QRIS (REQUIREMENT 2) & CASH FLOWS ================= */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-150 overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 bg-slate-950 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-display font-bold text-base leading-none text-white">Selesaikan Transaksi</h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{activeBranch.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Checkout pricing sum */}
                <div className="bg-slate-100 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jumlah Wajib Bayar:</span>
                  <span className="font-mono text-2xl font-extrabold text-slate-900">{formatRupiah(totalAmount)}</span>
                </div>

                {checkoutError && (
                  <p className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">{checkoutError}</p>
                )}

                {/* Payment Method Switcher */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block uppercase">Pilih Metode Pembayaran:</label>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Tunnel */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Tunai')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 duration-150 cursor-pointer ${
                        paymentMethod === 'Tunai'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Banknote className="w-6 h-6 text-emerald-600" />
                      <span className="text-xs tracking-wider">Tunai / Cash</span>
                    </button>

                    {/* QRIS PAYMENTS - REQUIREMENT 2 */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 duration-150 cursor-pointer ${
                        paymentMethod === 'QRIS'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                      <span className="text-xs tracking-wider">QRIS Cloud Pay</span>
                    </button>
                  </div>
                </div>

                {/* Sub panels based on selected method */}
                {paymentMethod === 'Tunai' ? (
                  /* Cash entry flow */
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-705 block uppercase">Input Uang Diterima (Rp)</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={cashPaid}
                        onChange={(e) => setCashPaid(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                        placeholder="Contoh: 50000"
                      />
                    </div>

                    {/* Quick nominal shortcuts */}
                    <div className="flex flex-wrap gap-2 pt-1 font-mono">
                      {[totalAmount, 20000, 50000, 100000, 200000].map((nom) => {
                        // Skip if nominal is less than totalAmount (except the precise totalAmount shortcut itself)
                        if (nom < totalAmount && nom !== totalAmount) return null;
                        return (
                          <button
                            key={nom}
                            type="button"
                            onClick={() => setCashPaid(nom)}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-[10.5px] font-bold rounded hover:bg-slate-100 cursor-pointer text-slate-700"
                          >
                            {nom === totalAmount ? 'Pas' : formatRupiah(nom)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Change due summary */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-150 mt-1">
                      <span className="text-xs font-semibold text-slate-500">Uang Kembalian:</span>
                      <span className="font-mono text-base font-extrabold text-emerald-700">{formatRupiah(changeAmount)}</span>
                    </div>
                  </div>
                ) : (
                  /* QRIS DISPLAY PANEL - REQUIREMENT 2 (Connected QRIS is shown here) */
                  <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                    
                    <div className="text-center space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest text-[#10b981]">PINDAI UNTUK PEMBAYARAN</h4>
                      <p className="text-[10px] text-slate-400">Total belanja dibukukan auto-sukses setelah dipindai oleh ponsel pembeli.</p>
                    </div>

                    {/* Display actual SVG or base64 loaded from image-selector */}
                    <div className="w-56 h-56 bg-white rounded-xl shadow-inner p-3 flex items-center justify-center border-2 border-slate-200">
                      {qrisImage.startsWith('<svg') ? (
                        <div className="w-full h-full scale-100" dangerouslySetInnerHTML={{ __html: qrisImage }} />
                      ) : (
                        <img src={qrisImage} alt="QRIS nusaPOS" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      )}
                    </div>

                    <div className="w-full text-center p-3 bg-white rounded-lg border border-slate-150 text-[10.5px] font-sans text-slate-600">
                      <p className="font-bold text-slate-800 uppercase tracking-widest leading-none mb-1">BNI Utama PT Nusantara Sukses Sejahtera</p>
                      <span>No. Rekening BNI Cloud: <span className="font-mono font-bold text-slate-900 underline">084-555-000-111</span></span>
                    </div>

                    <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[10.5px] font-bold animate-pulse flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rekening Terhubung & Siap Di-scan</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-sans shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessCheckoutSubmit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold rounded-xl text-xs tracking-wider uppercase shadow-md cursor-pointer"
                >
                  Konfirmasi Pembayaran Lunas
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: GORGEOUS PRINTABLE INVOICE RECEIPT ================= */}
      <AnimatePresence>
        {lastTx && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-300 p-6 space-y-4"
            >
              <div className="text-center space-y-1.5 border-b border-dashed border-slate-200 pb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded-full">
                  Transaksi Berhasil
                </span>
                <h4 className="font-display font-black text-xl text-slate-900 leading-none">nusaPOS cloud</h4>
                <p className="text-[10px] text-slate-650 leading-relaxed max-w-xs mx-auto">
                  {lastTx.branchName} <br />
                  {branches.find(b => b.name === lastTx.branchName)?.address || activeBranch.address}
                </p>
              </div>

              {/* Receipt details */}
              <div className="text-[11px] font-mono space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Nomor Nota:</span>
                  <span className="font-bold text-slate-800">{lastTx.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu Selesai:</span>
                  <span>{formatDateString(lastTx.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier :</span>
                  <span>{lastTx.cashierName} ({currentUser.role})</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Bayar:</span>
                  <span className="font-bold text-slate-800">{lastTx.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-dashed border-slate-200 py-3.5 space-y-2">
                {lastTx.items.map((it, idx) => (
                  <div key={idx} className="text-xs font-mono flex justify-between gap-3 text-slate-700">
                    <div className="flex-1">
                      <span className="block font-semibold text-slate-800">{it.productName}</span>
                      <span className="text-[10.5px] text-slate-400">
                        {it.quantity}x @ {formatRupiah(it.price)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Totals block */}
              <div className="text-xs font-mono space-y-1.5 text-slate-700 text-right">
                <div className="flex justify-between pl-12">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(lastTx.items.reduce((acc,curr) => acc + curr.subtotal, 0))}</span>
                </div>
                <div className="flex justify-between pl-12">
                  <span>PPN Pajak (10%):</span>
                  <span>{formatRupiah(Math.round(lastTx.items.reduce((acc,curr) => acc + curr.subtotal, 0) * 0.1))}</span>
                </div>
                <div className="flex justify-between pl-12 text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>TOTAL AKHIR:</span>
                  <span>{formatRupiah(lastTx.totalAmount)}</span>
                </div>
                <div className="flex justify-between pl-12">
                  <span>Uang Diterima:</span>
                  <span>{formatRupiah(lastTx.cashPaid)}</span>
                </div>
                <div className="flex justify-between pl-12 text-emerald-700 font-bold">
                  <span>Uang Kembalian:</span>
                  <span>{formatRupiah(lastTx.changeAmount)}</span>
                </div>
              </div>

              {/* Nice footer message */}
              <div className="text-center pt-4 border-t border-dashed border-slate-200 space-y-1.5">
                <p className="text-[10.5px] font-mono text-slate-400">Terima kasih atas kunjungan Anda!</p>
                <p className="text-[10px] font-sans text-slate-300">Struk ini sah dikeluarkan secara otomatis oleh nusaPOS Cloud Engine.</p>
                <div className="pt-2">
                  <button
                    onClick={() => setLastTx(null)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition uppercase tracking-wider"
                  >
                    Tutup & Transaksi Baru
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
