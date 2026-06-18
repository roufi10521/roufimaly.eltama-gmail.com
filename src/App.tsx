/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Branch, Category, Product, Transaction } from './types';
import { 
  ShoppingBag, Package, Store, FileSpreadsheet, LogOut, 
  UserCheck, ShieldCheck, MapPin, Grid, Info, Clock
} from 'lucide-react';
import { 
  INITIAL_USERS, 
  INITIAL_BRANCHES, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  DEFAULT_QRIS_SVG 
} from './mockData';

// import Firebase Firestore configuration and tools
import { db, seedDatabaseIfEmpty, testConnection } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

// import modular child panels
import LoginRegister from './components/LoginRegister';
import CashierPanel from './components/CashierPanel';
import InventoryPanel from './components/InventoryPanel';
import BranchPanel from './components/BranchPanel';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
  
  // --- STATE INITIALIZATION WITH CLOUD PERSISTENCE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nusapos_user');
    return saved ? JSON.parse(saved) : null;
  });

  // These collections are fully synchronized with Firestore in real-time
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [qrisImage, setQrisImage] = useState<string>(DEFAULT_QRIS_SVG);

  // Active terminal branch and active panel tab
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    const saved = localStorage.getItem('nusapos_active_branch_id');
    if (saved) return saved;
    return INITIAL_BRANCHES[0].id;
  });

  const [activeTab, setActiveTab] = useState<'cashier' | 'inventory' | 'branches' | 'reports'>('cashier');
  const [currentTime, setCurrentTime] = useState<string>('');

  // --- REAL-TIME FIRESTORE SYNCHRONIZATION EFFECT ---
  useEffect(() => {
    // 1. Establish connection and seed database if it's currently empty
    testConnection();
    
    // Seed initial collections to provide smooth starting point for Indonesian MSMEs
    const runSeeding = async () => {
      await seedDatabaseIfEmpty();
    };
    runSeeding();

    // 2. Attach real-time cloud snapshot listeners
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const items: User[] = [];
      snap.forEach((d) => {
        items.push(d.data() as User);
      });
      if (items.length > 0) {
        setUsers(items);
      }
    });

    const unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
      const items: Branch[] = [];
      snap.forEach((d) => {
        items.push(d.data() as Branch);
      });
      if (items.length > 0) {
        // Main branch sorted first
        items.sort((a, b) => (b.isMainBranch ? 1 : 0) - (a.isMainBranch ? 1 : 0));
        setBranches(items);
      }
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      const items: Category[] = [];
      snap.forEach((d) => {
        items.push(d.data() as Category);
      });
      if (items.length > 0) {
        setCategories(items);
      }
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const items: Product[] = [];
      snap.forEach((d) => {
        items.push(d.data() as Product);
      });
      if (items.length > 0) {
        setProducts(items);
      }
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      const items: Transaction[] = [];
      snap.forEach((d) => {
        items.push(d.data() as Transaction);
      });
      // Sort latest sales first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(items);
    });

    const unsubQris = onSnapshot(doc(db, 'settings', 'qris'), (snapDoc) => {
      if (snapDoc.exists()) {
        setQrisImage(snapDoc.data().value || DEFAULT_QRIS_SVG);
      }
    });

    return () => {
      unsubUsers();
      unsubBranches();
      unsubCategories();
      unsubProducts();
      unsubTransactions();
      unsubQris();
    };
  }, []);

  // --- PERSISTENCE EFFECT WORKERS FOR TERMINAL PREFERENCE ---
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nusapos_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nusapos_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nusapos_active_branch_id', activeBranchId);
  }, [activeBranchId]);

  // Clock runner
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS WITH ONLINE DATABASE PROPAGATION ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('cashier');
  };

  const handleRegister = async (newUser: User) => {
    try {
      const password = newUser.password || '123456';
      await setDoc(doc(db, 'users', newUser.id), { ...newUser, password });
    } catch (err) {
      console.error("Gagal mendaftarkan user:", err);
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin mengakhiri sesi kasir nusaPOS cloud saat ini?')) {
      setCurrentUser(null);
    }
  };

  const handleUpdateProducts = async (newProducts: Product[]) => {
    // 1. Detect Deleted products
    const currentIds = products.map(p => p.id);
    const newIds = newProducts.map(p => p.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));

    for (const id of deletedIds) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error("Gagal menghapus produk:", err);
      }
    }

    // 2. Detect Modified/Added products
    for (const prod of newProducts) {
      const found = products.find(p => p.id === prod.id);
      if (!found || JSON.stringify(found) !== JSON.stringify(prod)) {
        try {
          await setDoc(doc(db, 'products', prod.id), prod);
        } catch (err) {
          console.error("Gagal merubah data produk:", err);
        }
      }
    }
  };

  const handleUpdateCategories = async (newCategories: Category[]) => {
    // 1. Detect Deleted categories
    const currentIds = categories.map(c => c.id);
    const newIds = newCategories.map(c => c.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));

    for (const id of deletedIds) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err) {
        console.error("Gagal menghapus kategori:", err);
      }
    }

    // 2. Detect Modified/Added categories
    for (const cat of newCategories) {
      const found = categories.find(c => c.id === cat.id);
      if (!found || JSON.stringify(found) !== JSON.stringify(cat)) {
        try {
          await setDoc(doc(db, 'categories', cat.id), cat);
        } catch (err) {
          console.error("Gagal menyimpan kategori:", err);
        }
      }
    }
  };

  const handleUpdateBranches = async (newBranches: Branch[]) => {
    // 1. Detect Deleted branches
    const currentIds = branches.map(b => b.id);
    const newIds = newBranches.map(b => b.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));

    for (const id of deletedIds) {
      try {
        await deleteDoc(doc(db, 'branches', id));
      } catch (err) {
        console.error("Gagal menghapus cabang:", err);
      }
    }

    // 2. Detect Modified/Added branches
    for (const branch of newBranches) {
      const found = branches.find(b => b.id === branch.id);
      if (!found || JSON.stringify(found) !== JSON.stringify(branch)) {
        try {
          await setDoc(doc(db, 'branches', branch.id), branch);
        } catch (err) {
          console.error("Gagal menyimpan cabang:", err);
        }
      }
    }
  };

  const handleRecordTransaction = async (newTx: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (err) {
      console.error("Gagal merekam transaksi:", err);
    }
  };

  const handleUpdateQrisImage = async (newQris: string) => {
    try {
      await setDoc(doc(db, 'settings', 'qris'), { value: newQris });
    } catch (err) {
      console.error("Gagal memperbarui QRIS:", err);
    }
  };

  // Switch tabs ensuring proper access-levels
  const canAccessTab = (tab: typeof activeTab) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Kasir') {
      return tab === 'cashier';
    }
    return true;
  };

  const selectTabSafe = (tab: typeof activeTab) => {
    if (canAccessTab(tab)) {
      setActiveTab(tab);
    } else {
      alert(`Maaf, akun Anda bermutu "${currentUser?.role}". Sesuai sistem keamanan berjenjang, akses ke menu ini dibatasi.`);
    }
  };

  if (!currentUser) {
    return (
      <LoginRegister 
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  // Find active head branch object
  const activeBranchObj = branches.find(b => b.id === activeBranchId) || branches[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-850 antialiased selection:bg-emerald-100">
      
      {/* ================= GORGEOUS CORPORATE HEAD BAR ================= */}
      <header className="bg-white border-b border-slate-200/85 sticky top-0 z-35 shrink-0 px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] selection:bg-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Brand Logo & active clock */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-display font-extrabold text-sm shadow-md shadow-emerald-600/10 shrink-0">
              nP
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-lg font-display font-extrabold tracking-tight text-slate-900 leading-none">
                  nusa<span className="text-emerald-600">POS</span>
                </h1>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded font-mono text-[9px] uppercase tracking-wider">
                  Cloud
                </span>
              </div>
              
              {/* Dynamic live clock */}
              <div className="flex items-center space-x-1.5 text-[10.5px] text-slate-400 mt-0.5 font-sans font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-350" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Active branch and user stats container */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:divide-x md:divide-slate-200">
            
            {/* Branch display */}
            <div className="flex items-center space-x-2 text-xs text-slate-600 pr-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">Lokasi Sesi</span>
                <span className="font-semibold text-slate-800">{activeBranchObj.name}</span>
              </div>
            </div>

            {/* Logged user credentials */}
            <div className="flex items-center space-x-3 pl-3 pr-2 py-0.5">
              
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 shrink-0 border border-slate-100 flex items-center justify-center font-display font-extrabold text-xs">
                {currentUser.fullname.charAt(0)}
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold font-display text-slate-900 leading-none">{currentUser.fullname}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-sans tracking-widest ${
                    currentUser.role === 'Owner' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : currentUser.role === 'Manager' 
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-250' 
                        : currentUser.role === 'Admin Toko' 
                          ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                          : 'bg-pink-50 text-pink-800 border border-pink-220'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Terhubung Akun: @{currentUser.username}</span>
              </div>

            </div>

            {/* Logout trigger button */}
            <div className="pl-3 py-1">
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 duration-150 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Keluar Sesi"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ================= SECONDARY NAVIGATION RAIL ================= */}
      <nav className="bg-slate-900 text-white shrink-0 shadow-inner px-6 py-1 select-none">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-2 py-1.5 scrollbar-none font-display">
          
          <button
            onClick={() => selectTabSafe('cashier')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 duration-150 cursor-pointer ${
              activeTab === 'cashier'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Kasir POS Terminal</span>
          </button>

          {/* Locked indicators for cashiers */}
          <button
            onClick={() => selectTabSafe('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 duration-150 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : currentUser.role === 'Kasir'
                  ? 'opacity-30 text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Kelola Produk & Kategori</span>
            {currentUser.role === 'Kasir' && <span className="text-[8.5px] bg-red-950 text-red-400 px-1 rounded">Locked</span>}
          </button>

          <button
            onClick={() => selectTabSafe('branches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 duration-150 cursor-pointer ${
              activeTab === 'branches'
                ? 'bg-emerald-600 text-white shadow-sm'
                : currentUser.role === 'Kasir'
                  ? 'opacity-30 text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Edit Alamat Cabang</span>
            {currentUser.role === 'Kasir' && <span className="text-[8.5px] bg-red-950 text-red-400 px-1 rounded">Locked</span>}
          </button>

          <button
            onClick={() => selectTabSafe('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 duration-150 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-sm'
                : currentUser.role === 'Kasir'
                  ? 'opacity-30 text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Laporan Omset & Transaksi</span>
            {currentUser.role === 'Kasir' && <span className="text-[8.5px] bg-red-950 text-red-400 px-1 rounded">Locked</span>}
          </button>

        </div>
      </nav>

      {/* ================= MAIN INTERACTIVE WORKSPACE ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        
        {/* Render selected tabs */}
        {activeTab === 'cashier' && (
          <CashierPanel
            currentUser={currentUser}
            branches={branches}
            categories={categories}
            products={products}
            onUpdateProducts={handleUpdateProducts}
            onRecordTransaction={handleRecordTransaction}
            qrisImage={qrisImage}
            onUpdateQrisImage={handleUpdateQrisImage}
            activeBranchId={activeBranchId}
            onChangeActiveBranchId={setActiveBranchId}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPanel
            currentUser={currentUser}
            categories={categories}
            products={products}
            onUpdateCategories={handleUpdateCategories}
            onUpdateProducts={handleUpdateProducts}
          />
        )}

        {activeTab === 'branches' && (
          <BranchPanel
            currentUser={currentUser}
            branches={branches}
            onUpdateBranches={handleUpdateBranches}
          />
        )}

        {activeTab === 'reports' && (
          <HistoryPanel
            currentUser={currentUser}
            branches={branches}
            transactions={transactions}
          />
        )}

      </main>

    </div>
  );
}
