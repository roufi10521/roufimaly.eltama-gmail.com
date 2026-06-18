/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Category, Product } from '../types';
import { 
  FolderPlus, Plus, Edit2, Check, X, ShieldAlert, Package, 
  Trash2, Layers, AlertCircle, RefreshCw, BarChart2, Hash, DollarSign,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { formatRupiah } from '../utils';

interface InventoryPanelProps {
  currentUser: User;
  categories: Category[];
  products: Product[];
  onUpdateCategories: (updatedCategories: Category[]) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export default function InventoryPanel({
  currentUser,
  categories,
  products,
  onUpdateCategories,
  onUpdateProducts
}: InventoryPanelProps) {
  const isCashierOnly = currentUser.role === 'Kasir';

  // Toggle View
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories'>('products');

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // New Product State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(10000);
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdImage, setNewProdImage] = useState<string>('');
  const [prodError, setProdError] = useState('');

  // Editing Product State
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCatId, setEditProdCatId] = useState('');
  const [editProdPrice, setEditProdPrice] = useState<number>(0);
  const [editProdStock, setEditProdStock] = useState<number>(0);
  const [editProdSku, setEditProdSku] = useState('');
  const [editProdImage, setEditProdImage] = useState<string>('');
  const [editProdError, setEditProdError] = useState('');

  // --- CATEGORIES HANDLERS ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (isCashierOnly) return;

    if (!newCatName.trim()) {
      setCatError('Nama kategori tidak boleh kosong!');
      return;
    }

    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCatName.toLowerCase().trim()
    );
    if (exists) {
      setCatError('Kategori dengan nama ini sudah terdaftar!');
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    onUpdateCategories([...categories, newCategory]);
    setNewCatName('');
  };

  const handleStartEditCat = (cat: Category) => {
    if (isCashierOnly) return;
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setCatError('');
  };

  const handleSaveEditCat = (id: string) => {
    if (!editCatName.trim()) {
      setCatError('Nama kategori suntingan tidak boleh kosong!');
      return;
    }

    const exists = categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === editCatName.toLowerCase().trim()
    );
    if (exists) {
      setCatError('Nama kategori ini sudah digunakan oleh kategori lain!');
      return;
    }

    const updated = categories.map((c) => {
      if (c.id === id) {
        return { ...c, name: editCatName.trim() };
      }
      return c;
    });

    onUpdateCategories(updated);
    setEditingCatId(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (isCashierOnly) return;

    // Check if category is used by any products
    const inUse = products.some((p) => p.categoryId === id);
    if (inUse) {
      alert(`Gagal menghapus! Kategori "${name}" masih terhubung dengan beberapa produk. Pindahkan atau hapus produknya terlebih dahulu.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}" secara permanen?`)) {
      const filtered = categories.filter((c) => c.id !== id);
      onUpdateCategories(filtered);
    }
  };

  // --- PRODUCTS HANDLERS ---
  const handleFileRead = (file: File, callback: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('Berkas harus berupa gambar / foto!');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProdError('');
    if (isCashierOnly) return;

    if (!newProdName.trim() || !newProdCatId || newProdPrice <= 0 || newProdStock < 0) {
      setProdError('Pastikan nama produk benar, kategori dipilih, harga > Rp 0, dan jumlah stok >= 0!');
      return;
    }

    const generatedSku = newProdSku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      categoryId: newProdCatId,
      price: newProdPrice,
      stock: newProdStock,
      sku: generatedSku,
      image: newProdImage || undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    onUpdateProducts([...products, newProduct]);
    
    // Reset Form
    setNewProdName('');
    setNewProdPrice(10000);
    setNewProdStock(10);
    setNewProdSku('');
    setNewProdCatId('');
    setNewProdImage('');
    setIsAddingProduct(false);
  };

  const handleStartEditProduct = (prod: Product) => {
    if (isCashierOnly) return;
    setEditingProdId(prod.id);
    setEditProdName(prod.name);
    setEditProdCatId(prod.categoryId);
    setEditProdPrice(prod.price);
    setEditProdStock(prod.stock);
    setEditProdSku(prod.sku);
    setEditProdImage(prod.image || '');
    setEditProdError('');
  };

  const handleSaveEditProduct = (id: string) => {
    if (!editProdName.trim() || !editProdCatId || editProdPrice <= 0 || editProdStock < 0) {
      setEditProdError('Formulir tidak boleh kosong. Harga harus > 0 dan stok >= 0.');
      return;
    }

    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          name: editProdName.trim(),
          categoryId: editProdCatId,
          price: editProdPrice,
          stock: editProdStock,
          sku: editProdSku.trim(),
          image: editProdImage || undefined
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setEditingProdId(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (isCashierOnly) return;

    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari sistem nusaPOS Cloud?`)) {
      const filtered = products.filter((p) => p.id !== id);
      onUpdateProducts(filtered);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-display font-bold text-slate-800">Gudang & Inventaris Produk</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operasional nusaPOS cloud: edit atau hapus kategori, serta ubah informasi harga dan jumlah (stok) produk secara real-time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 self-stretch md:self-auto">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'products'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Daftar Produk
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'categories'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Kelola Kategori
          </button>
        </div>
      </div>

      {/* Role blocker notification */}
      {isCashierOnly && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Perangkat Terkunci (Sesi Kasir):</span> 
            <span> Anda login dengan akun berlevel Kasir. Sesuai aturan akses berjenjang nusaPOS, Anda dapat melihat produk tetapi DILARANG mengubah stok, menambah, menyunting, atau menghapus produk/kategori.</span>
          </div>
        </div>
      )}

      {/* ================= SECTION 1: CATEGORIES CRUD ================= */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Add Category Form Panel */}
          {!isCashierOnly && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-600" /> Tambah Kategori Baru
              </h3>
              
              {catError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              <form onSubmit={handleAddCategory} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-705">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kue & Bakery"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Simpan Kategori
                </button>
              </form>
            </div>
          )}

          {/* List of categories with Edit/Delete features */}
          <div className={`${isCashierOnly ? 'md:col-span-3' : 'md:col-span-2'} bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Kategori Terdaftar ({categories.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">ID Cloud Database</span>
            </div>

            <div className="divide-y divide-slate-100">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;

                return (
                  <div key={cat.id} className="py-3.5 flex items-center justify-between gap-4">
                    {isEditing ? (
                      /* Inline Category input */
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          className="flex-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                        />
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Batal
                        </button>
                        <button
                          onClick={() => handleSaveEditCat(cat.id)}
                          className="p-1 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Simpan
                        </button>
                      </div>
                    ) : (
                      /* Category view info */
                      <>
                        <div className="flex flex-col">
                          <span className="font-display font-semibold text-sm text-slate-800">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {cat.id}
                          </span>
                        </div>

                        {!isCashierOnly && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStartEditCat(cat)}
                              className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-500 hover:text-emerald-600 rounded-lg cursor-pointer duration-150"
                              title="Edit Nama Kategori"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer duration-150"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: PRODUCTS CRUD & QUANTITY MODIFICATION ================= */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          
          {/* Add Product Block triggers */}
          {!isCashierOnly && (
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
              <span className="text-xs text-slate-600 font-medium font-sans">
                Apakah ada komoditas baru? Daftarkan produk, sku, harga, dan stok mula di database ritel.
              </span>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 duration-150 cursor-pointer shadow-sm"
              >
                {isAddingProduct ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isAddingProduct ? 'Tutup Formulir' : 'Daftarkan Produk Baru'}
              </button>
            </div>
          )}

          {/* New Product Form Box */}
          <AnimatePresence>
            {isAddingProduct && !isCashierOnly && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4 overflow-hidden"
              >
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Package className="w-4 h-4 text-emerald-650" /> Formulir Produk Baru
                </h3>

                {prodError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-1.5 animate-bounce">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{prodError}</span>
                  </div>
                )}

                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Nama Produk</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Es Kopi Susu Aren"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Pilih Kategori</label>
                    <select
                      required
                      value={newProdCatId}
                      onChange={(e) => setNewProdCatId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                    >
                      <option value="">-- Pilih --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nomor SKU / Barkode</label>
                    <input
                      type="text"
                      placeholder="Autogenerate jika kosong"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  {/* Stock count which is an explicit user requirement */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Jumlah Stok (Kuantitas)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  {/* Image Upload Area with Drag and Drop Support */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">Gambar Produk (Opsional)</label>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileRead(file, setNewProdImage);
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3.5 bg-slate-50 flex items-center gap-3 transition cursor-pointer relative"
                    >
                      {newProdImage ? (
                        <>
                          <img 
                            src={newProdImage} 
                            alt="Preview" 
                            className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 text-left">
                            <p className="text-[10px] font-bold text-slate-700 leading-tight">Foto Produk Terpilih</p>
                            <button
                              type="button"
                              onClick={() => setNewProdImage('')}
                              className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold cursor-pointer"
                            >
                              Hapus Gambar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                            <Upload className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <label className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer block">
                              Pilih Foto Produk
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileRead(file, setNewProdImage);
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-slate-400 leading-none">atau seret file ke sini (.png, .jpg)</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-end justify-end">
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm duration-150 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Tambah Produk
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Products List Grid */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Katalog & Stok Terdaftar ({products.length} Item)
              </span>
              <div className="flex gap-4 text-xs font-sans text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span> Habis/Krisis</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Aman</span>
              </div>
            </div>

            {/* Core Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-100/30 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6 h-10">Produk & SKU</th>
                    <th className="py-3 px-4 h-10">Kategori</th>
                    <th className="py-3 px-4 h-10 text-right">Harga Jual</th>
                    <th className="py-3 px-4 h-10 text-center">Jumlah Stok</th>
                    <th className="py-3 px-6 h-10 text-center">Tindakan operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {products.map((prod) => {
                    const isEditing = editingProdId === prod.id;
                    const catName = categories.find((c) => c.id === prod.categoryId)?.name || 'Tanpa Kategori';

                    // Assess general availability status visually
                    const isLowStock = prod.stock <= 5;
                    const isOutOfStock = prod.stock === 0;

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-slate-50/70 transition duration-100 ${
                          isOutOfStock ? 'bg-red-50/10' : isLowStock ? 'bg-amber-50/15' : ''
                        }`}
                      >
                        {isEditing ? (
                          /* ================= INLINE PROD EDIT FORM ================= */
                          <td colSpan={5} className="p-5 bg-slate-50/85">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                  <Edit2 className="w-3.5 h-3.5 text-emerald-600" /> Mode Sunting Produk
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</span>
                              </div>

                              {editProdError && (
                                <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded">{editProdError}</p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-bold text-slate-705 block uppercase">Nama Produk</label>
                                  <input
                                    type="text"
                                    value={editProdName}
                                    onChange={(e) => setEditProdName(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-705 block uppercase">Kategori</label>
                                  <select
                                    value={editProdCatId}
                                    onChange={(e) => setEditProdCatId(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                  >
                                    {categories.map((c) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-705 block uppercase">SKU</label>
                                  <input
                                    type="text"
                                    value={editProdSku}
                                    onChange={(e) => setEditProdSku(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-705 block uppercase">Harga Jual (Rp)</label>
                                  <input
                                    type="number"
                                    value={editProdPrice}
                                    onChange={(e) => setEditProdPrice(Number(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                  />
                                </div>

                                {/* EDIT STOCK LEVEL - DIRECTLY MATCHES REQUIREMENT 5 */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-705 block uppercase bg-emerald-50 text-emerald-800 px-1 rounded">Edit Jumlah Stok</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={editProdStock}
                                    onChange={(e) => setEditProdStock(Number(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* EDIT IMAGE LEVEL WITH DRAG AND DROP */}
                              <div className="space-y-1.5 pt-1.5 border-t border-slate-100/75">
                                <label className="text-[10.5px] font-bold text-slate-705 block uppercase text-left">Gambar Produk (Opsional)</label>
                                <div 
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleFileRead(file, setEditProdImage);
                                  }}
                                  className="border border-dashed border-slate-250 rounded-lg p-2.5 bg-slate-50 flex items-center gap-3 transition cursor-pointer relative"
                                >
                                  {editProdImage ? (
                                    <>
                                      <img 
                                        src={editProdImage} 
                                        alt="Preview" 
                                        className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="flex-1 text-left">
                                        <p className="text-[10px] font-bold text-slate-700 leading-tight">Foto Produk Terpilih</p>
                                        <button
                                          type="button"
                                          onClick={() => setEditProdImage('')}
                                          className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold cursor-pointer"
                                        >
                                          Hapus Gambar
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                                        <Upload className="w-4 h-4 text-slate-400" />
                                      </div>
                                      <div className="flex-1 text-left">
                                        <label className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer block leading-tight">
                                          Pilih Foto Baru / Sunting Foto
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleFileRead(file, setEditProdImage);
                                             }}
                                            className="hidden"
                                          />
                                        </label>
                                        <span className="text-[10px] text-slate-400 leading-none">atau seret file ke sini</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setEditingProdId(null)}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" /> Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditProduct(prod.id)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" /> Simpan Perubahan
                                </button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          /* ================= NORMAL DISPLAY MODE ================= */
                          <>
                            {/* Product Info with custom vector styles resembling a beautiful card layout */}
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-150 shrink-0 shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-display font-black text-xl uppercase shrink-0 ${
                                    isOutOfStock ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {prod.name.charAt(0)}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-800 leading-tight block">{prod.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                                    <Hash className="w-3 h-3 text-slate-350" /> SKU: {prod.sku}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-slate-600">
                              <span className="inline-flex px-2 py-0.5 bg-slate-100 border border-slate-150 text-[10px] font-semibold rounded-md">
                                {catName}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <span className="font-mono text-[13px] font-bold text-slate-800">
                                {formatRupiah(prod.price)}
                              </span>
                            </td>

                            {/* Stock Display */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className={`font-mono text-[13px] font-bold ${
                                  isOutOfStock 
                                    ? 'text-red-600 line-through' 
                                    : isLowStock 
                                      ? 'text-orange-600' 
                                      : 'text-slate-800'
                                }`}>
                                  {prod.stock} unit
                                </span>
                                {isOutOfStock ? (
                                  <span className="px-1 text-[8.5px] font-bold text-red-600 bg-red-50 rounded uppercase font-mono tracking-widest">Habis Total</span>
                                ) : isLowStock ? (
                                  <span className="px-1 text-[8.5px] font-bold text-orange-600 bg-orange-50 rounded uppercase font-mono tracking-widest">Krisis</span>
                                ) : (
                                  <span className="px-1 text-[8.5px] font-bold text-emerald-600 bg-emerald-50 rounded uppercase font-mono tracking-widest">Aman</span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-6 text-center">
                              {!isCashierOnly ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => handleStartEditProduct(prod)}
                                    className="p-1 px-2.5 bg-slate-50 border border-slate-205 hover:bg-emerald-50 text-slate-600 hover:text-emerald-750 font-bold text-[10px] duration-150 rounded-lg cursor-pointer flex items-center gap-1"
                                    title="Edit Nama, Kategori, Harga & STOK"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" /> Sunting
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                    className="p-1 px-1.5 text-slate-400 hover:text-red-550 hover:bg-red-50 duration-150 rounded-lg cursor-pointer flex items-center"
                                    title="Hapus Produk"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Izin Terkunci</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="p-8 text-center bg-slate-50">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-530 font-bold text-sm">Gudang Kosong!</p>
                  <p className="text-xs text-slate-400">Silakan daftarkan produk retail Anda terlebih dahulu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
