/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Branch } from '../types';
import { MapPin, Phone, Plus, Edit2, Check, X, ShieldAlert, Store, AlertCircle, Trash2 } from 'lucide-react';

interface BranchPanelProps {
  currentUser: User;
  branches: Branch[];
  onUpdateBranches: (updatedBranches: Branch[]) => void;
}

export default function BranchPanel({ currentUser, branches, onUpdateBranches }: BranchPanelProps) {
  const isCashierOnly = currentUser.role === 'Kasir';
  
  // State for adding a new branch
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addError, setAddError] = useState('');

  // State for editing an existing branch
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (isCashierOnly) {
      setAddError('Tingkat akses Anda (Kasir) tidak diizinkan menambah cabang.');
      return;
    }

    if (!newName.trim() || !newAddress.trim() || !newPhone.trim()) {
      setAddError('Seluruh field cabang baru wajib diisi!');
      return;
    }

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name: newName.trim(),
      address: newAddress.trim(),
      phone: newPhone.trim(),
      isActive: true
    };

    onUpdateBranches([...branches, newBranch]);
    
    // Reset states
    setNewName('');
    setNewAddress('');
    setNewPhone('');
    setIsAdding(false);
  };

  const handleStartEdit = (branch: Branch) => {
    if (isCashierOnly) return;
    setEditingId(branch.id);
    setEditName(branch.name);
    setEditAddress(branch.address);
    setEditPhone(branch.phone);
    setEditError('');
  };

  const handleSaveEdit = (id: string) => {
    setEditError('');
    if (!editName.trim() || !editAddress.trim() || !editPhone.trim()) {
      setEditError('Semua kolom suntingan wajib diisi!');
      return;
    }

    const updated = branches.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          name: editName.trim(),
          address: editAddress.trim(),
          phone: editPhone.trim()
        };
      }
      return b;
    });

    onUpdateBranches(updated);
    setEditingId(null);
  };

  const handleDeleteBranch = (id: string) => {
    if (isCashierOnly) return;
    if (branches.length <= 1) {
      alert('Pencabutan dibatalkan. Harus ada minimal satu cabang aktif sebagai pusat!');
      return;
    }
    const filtered = branches.filter((b) => b.id !== id);
    onUpdateBranches(filtered);
  };

  const toggleBranchActive = (id: string) => {
    if (isCashierOnly) return;
    const updated = branches.map((b) => {
      if (b.id === id) {
        return { ...b, isActive: !b.isActive };
      }
      return b;
    });
    onUpdateBranches(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-display font-bold text-slate-800">Manajemen Cabang & Outlet</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lihat, edit alamat operasional nusaPOS cloud Anda atau daftarkan sebanyak mungkin cabang baru.
          </p>
        </div>

        {!isCashierOnly ? (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 duration-150 cursor-pointer shadow-sm"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? 'Batal Tambah' : 'Tambah Cabang Baru'}
          </button>
        ) : (
          <div className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Kasir: Izin Sunting Terkunci</span>
          </div>
        )}
      </div>

      {/* Add Branch Form Pane */}
      <AnimatePresence>
        {isAdding && !isCashierOnly && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plus className="w-4 h-4 text-emerald-600" /> Registrasi Cabang Baru
            </h3>
            
            {addError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddBranch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nama Cabang / Outlet</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: nusaPOS - Semarang Simpang Lima"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nomor Telepon Cabang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0821-4455-6677"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-slate-700">Alamat Lengkap Cabang (Detail Jalan, Kecamatan, Kota)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Jl. Pahlawan No. 45, Mugassari, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah 50249"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition resize-none"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" /> Simpan Cabang Baru
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Existing Branches (Requirement 3: Sunting dan tambah banyak lagi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => {
          const isEditing = editingId === branch.id;

          return (
            <div
              key={branch.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-200 relative overflow-hidden ${
                branch.isActive ? 'border-slate-150' : 'opacity-60 border-slate-200 bg-slate-50'
              } ${isEditing ? 'ring-2 ring-emerald-500 shadow-md' : ''}`}
            >
              {/* Branch State Badges */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {branch.isMainBranch && (
                  <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full font-mono text-[9px] font-bold uppercase">
                    Pusat / HQ
                  </span>
                )}
                {isEditing ? (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono text-[9px] font-bold uppercase">
                    Sedang Edit
                  </span>
                ) : (
                  <button
                    disabled={isCashierOnly}
                    onClick={() => toggleBranchActive(branch.id)}
                    className={`px-2 py-1.5 rounded-full font-display font-bold text-[9px] uppercase cursor-pointer transition ${
                      branch.isActive 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {branch.isActive ? '● Aktif' : '○ Non-Aktif'}
                  </button>
                )}
              </div>

              {/* Box Info */}
              <div className="flex items-start gap-3 mt-1 pr-16">
                <div className={`p-2.5 rounded-xl ${branch.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <MapPin className="w-5 h-5" />
                </div>

                <div className="space-y-3 w-full">
                  {isEditing ? (
                    /* Inline Editor Fields */
                    <div className="space-y-3.5 pr-2">
                      {editError && <p className="text-[10px] text-red-650 bg-red-50 p-1.5 rounded">{editError}</p>}
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Nama Cabang</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">No. Telepon Kontak</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Alamat Pengiriman/Operasional</label>
                        <textarea
                          rows={3}
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                        />
                      </div>

                      {/* Control buttons inside inline editor */}
                      <div className="flex gap-2 pt-1 font-sans justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Batal
                        </button>
                        <button
                          onClick={() => handleSaveEdit(branch.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Static Mode */
                    <div className="space-y-2">
                      <h4 className="font-display font-bold text-base text-slate-800 leading-tight">
                        {branch.name}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{branch.phone}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {branch.address}
                      </p>

                      {/* Display Mode Control Buttons (Hidden for Cashier) */}
                      {!isCashierOnly && (
                        <div className="flex gap-2 pt-2 justify-end border-t border-slate-100">
                          <button
                            disabled={branch.isMainBranch}
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="p-1 px-2 hover:bg-red-550 hover:bg-red-50 text-slate-400 hover:text-red-6 * cursor-pointer text-red-500 rounded-lg flex items-center gap-1 text-[11px] font-medium duration-150 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title="Hapus Cabang"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                          <button
                            onClick={() => handleStartEdit(branch)}
                            className="p-1 px-3 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-750 cursor-pointer rounded-lg border border-slate-155 hover:border-emerald-200 flex items-center gap-1 text-[11px] font-bold duration-150"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Alamat Cabang
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
