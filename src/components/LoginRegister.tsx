/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, UserRole } from '../types';
import { Shield, Sparkles, Key, Mail, UserPlus, Info, CheckCircle2, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { INITIAL_USERS } from '../mockData';

interface LoginRegisterProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export default function LoginRegister({ users, onLogin, onRegister }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('owner');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regFullname, setRegFullname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Kasir');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // For simplicity, we match username or email from the users list
    const foundUser = users.find(
      (u) => 
        (u.username.toLowerCase() === loginUsername.toLowerCase().trim() || 
         u.email.toLowerCase() === loginUsername.toLowerCase().trim())
    );

    if (foundUser) {
      // In this client-side mock implementation, we accept any password or '123456' by default
      onLogin(foundUser);
    } else {
      setLoginError('Pengguna tidak ditemukan atau kata sandi salah. Silakan coba username default: "owner"');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess(false);

    if (!regUsername || !regFullname || !regEmail || !regPassword) {
      setRegisterError('Semua kolom registrasi wajib diisi!');
      return;
    }

    const usernameExists = users.some(
      (u) => u.username.toLowerCase() === regUsername.toLowerCase().trim()
    );
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === regEmail.toLowerCase().trim()
    );

    if (usernameExists) {
      setRegisterError('Username ini sudah terdaftar!');
      return;
    }

    if (emailExists) {
      setRegisterError('Email ini sudah terdaftar!');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: regUsername.trim().toLowerCase(),
      fullname: regFullname,
      email: regEmail.trim(),
      role: regRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    onRegister(newUser);
    setRegisterSuccess(true);
    
    // Auto populate login username for convenient login
    setLoginUsername(newUser.username);
    setLoginPassword('123456'); // Mock set
    
    // Reset register form fields
    setRegUsername('');
    setRegFullname('');
    setRegEmail('');
    setRegPassword('');
    
    // Auto switch to login after 2 seconds
    setTimeout(() => {
      setIsLogin(true);
      setRegisterSuccess(false);
    }, 2000);
  };

  // Helper values for access-level details
  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'Owner':
        return 'Hak akses penuh aplikasi: manajemen keuangan, audit transaksi, kelola cabang, ubah QRIS, kelola kategori dan produk.';
      case 'Manager':
        return 'Hak kelola operasional penuh: pantau kasir, kelola stok produk & ketegori, edit cabang, tanpa laporan keuangan laba-rugi sensitif.';
      case 'Admin Toko':
        return 'Hak kelola inventaris dan logistik: tambah/edit/hapus produk, edit kategori, tambah cabang, cetak laporan stok cabang.';
      case 'Kasir':
        return 'Fokus transaksi penjualan: kasir POS cepat, cetak struk pembeli, input kuantitas keranjang, terima pembayaran (Tunai/QRIS).';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
      
      {/* Left side: Premium Branding Info */}
      <div className="flex-1 flex flex-col justify-between bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 text-white p-8 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        
        {/* Top Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald-500/20 shadow-lg">
            <ShoppingBag className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-white leading-none">
              nusa<span className="text-emerald-400">POS</span>
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400">Cloud Retail Engine</span>
          </div>
        </div>

        {/* Hero Concept Info */}
        <div className="my-auto py-12 lg:py-0 z-10 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Versi Cloud v2.4.0 • Optimal & Cepat</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            Kelola Bisnis Ritel Nusantara Lebih Mudah.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Solusi point-of-sale modern multi-cabang dengan hak akses berjenjang yang aman, 
            sistem kategori produk tak terbatas, serta transaksi QRIS terintegrasi rekening langsung.
          </p>

          {/* Quick Demo Accounts Info Card */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm shadow-xl">
            <h3 className="text-emerald-400 font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Akun Demo Bawaan (Gunakan untuk Uji Coba):
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-emerald-300 block font-semibold">1. Level Owner</span>
                <span>Username: <span className="text-white underline">owner</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-yellow-300 block font-semibold">2. Level Manager</span>
                <span>Username: <span className="text-white underline">manager_miko</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-blue-300 block font-semibold">3. Level Admin Toko</span>
                <span>Username: <span className="text-white underline">admin_toko</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-pink-300 block font-semibold">4. Level Kasir</span>
                <span>Username: <span className="text-white underline">kasir_doni</span></span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 italic">
              * Sandi untuk semua akun bawaan adalah bebas (atau isi sembarang/kosong).
            </div>
          </div>
        </div>

        {/* Footer Brand */}
        <div className="text-xs text-slate-400 z-10">
          &copy; 100% Produk Nusa Karya Digital. Seluruh data auto-tersimpan di cloud nusaPOS.
        </div>
      </div>

      {/* Right side: Login & Registration Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 relative">
          
          {/* Header Switcher */}
          <div className="flex border-b border-slate-100 mb-8 pb-1">
            <button
              onClick={() => { setIsLogin(true); setLoginError(''); setRegisterError(''); }}
              className={`flex-1 pb-3 text-center font-display font-semibold text-lg transition-all relative ${
                isLogin ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Masuk POS
              {isLogin && <motion.div layoutId="under" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
            </button>
            <button
              onClick={() => { setIsLogin(false); setLoginError(''); setRegisterError(''); }}
              className={`flex-1 pb-3 text-center font-display font-semibold text-lg transition-all relative ${
                !isLogin ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Daftar Pegawai Baru
              {!isLogin && <motion.div layoutId="under" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
            </button>
          </div>

          {/* Form Switch Area */}
          {isLogin ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-display font-bold text-slate-900">Selamat Datang Kembali</h3>
                <p className="text-sm text-slate-500">Silakan masukkan akun retail Anda untuk memulai sesi kasir.</p>
              </div>

              {loginError && (
                <div id="login-error-msg" className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Username atau Email POS</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username atau email..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">PIN / Kata Sandi Sesi</label>
                  <span className="text-xs text-slate-400">(Bebas diisi untuk demo)</span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan sandi atau isi acak..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ================= REQUIREMENT 1: TOMBOL LOGIN HIJAU YANG SANGAT JELAS DENGAN KOTAK HIJAU ================= */}
              <div className="pt-2">
                {/* 
                  Tombol ini didesain dengan kotak pembungkus hijau menyala, 
                  background hijau zamrud pekat, border hijau, efek shadow tebal, 
                  dan teks putih berkilau yang menjamin visual terbukti jelas dan tidak bisa dilewatkan.
                */}
                <div className="p-1 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <button
                    id="btn-login-pos"
                    type="submit"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 cursor-pointer text-shadow-sm uppercase tracking-wider text-sm"
                  >
                    <Shield className="w-4.5 h-4.5 text-emerald-200 animate-pulse animate-duration-1000" />
                    Hubungkan & Masuk Sekarang
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[11px] text-slate-400 block">Sandi Sesi Dilindungi HTTPS • nusaPOS Cloud Secure</span>
                </div>
              </div>
            </form>
          ) : (
            /* ================= REGISTER FORM (WITH TIERED SECURITY LABELS) ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-xl font-display font-bold text-slate-900">Registrasi Berjenjang</h3>
                <p className="text-xs text-slate-500">Mendaftarkan personel baru dengan hak keamanan berjenjang sesuai tanggung jawab.</p>
              </div>

              {registerError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {registerSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Registrasi berhasil! Mengalihkan ke login dalam 2 detik...</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Nama Lengkap Pegawai</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="register-fullname"
                    type="text"
                    required
                    value={regFullname}
                    onChange={(e) => setRegFullname(e.target.value)}
                    placeholder="Contoh: Rian Anggara"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Username Akun POS</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">@</span>
                  <input
                    id="register-username"
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="rian_kasir"
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Alamat Email Kerja</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="rian@nusapos.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">PIN Sandi (Daftar)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="register-password"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Buat 6 digit PIN atau kata sandi..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* ================= REGISTRATION ROLE CHOOSE : TIERED ACCESS ================= */}
              <div className="space-y-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Pilih Hak Akses Berjenjang:
                </label>
                <select
                  id="register-role-select"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
                >
                  <option value="Kasir">Kasir (Level 1 - Terendah)</option>
                  <option value="Admin Toko">Admin Toko (Level 2 - Menengah)</option>
                  <option value="Manager">Manager (Level 3 - Tinggi)</option>
                  <option value="Owner">Owner / Pemilik (Level 4 - Tertinggi)</option>
                </select>

                <div className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded border border-emerald-100 leading-relaxed">
                  <span className="font-semibold text-emerald-700 block mb-0.5">Penjelasan Izin:</span>
                  {getRoleDescription(regRole)}
                </div>
              </div>

              {/* Submit Register Button */}
              <div className="pt-1">
                <button
                  id="btn-register-submit"
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 duration-150 hover:bg-slate-800 text-white font-display font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Daftarkan Pengguna
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
