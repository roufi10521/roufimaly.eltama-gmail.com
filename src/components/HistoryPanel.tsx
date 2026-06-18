/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Branch, Transaction } from '../types';
import { 
  FileSpreadsheet, Receipt, TrendingUp, Calendar, 
  MapPin, UserCheck, CreditCard, ChevronRight, ShoppingBag, Eye 
} from 'lucide-react';
import { formatRupiah, formatDateString } from '../utils';

interface HistoryPanelProps {
  currentUser: User;
  branches: Branch[];
  transactions: Transaction[];
}

export default function HistoryPanel({ currentUser, branches, transactions }: HistoryPanelProps) {
  const isCashierOnly = currentUser.role === 'Kasir';

  // Filter states
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);

  // Filtered transactions
  const filteredTxs = transactions.filter((tx) => {
    const matchesBranch = selectedBranchId === 'all' || tx.branchId === selectedBranchId;
    const matchesMethod = selectedMethod === 'all' || tx.paymentMethod === selectedMethod;
    return matchesBranch && matchesMethod;
  });

  // Basic stats calculations
  const totalSales = filteredTxs.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalItemCount = filteredTxs.reduce((acc, curr) => 
    acc + curr.items.reduce((s, u) => s + u.quantity, 0), 0
  );
  const averageTicket = filteredTxs.length > 0 ? Math.round(totalSales / filteredTxs.length) : 0;

  return (
    <div className="space-y-6">

      {/* Header and Stats blocks (Bento report Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Intro */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-display font-bold text-slate-800">Laporan Penjualan Real-time</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Audit cloud data transaksi terintegrasi seluruh cabang. Sesuai hak keamanan berjenjang, akun Anda ({currentUser.fullname} - <span className="text-emerald-700 font-bold">{currentUser.role}</span>) dapat memantau log pembukuan.
          </p>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 mt-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Saring Cabang:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-205 text-xs rounded-lg text-slate-800 cursor-pointer outline-none"
              >
                <option value="all">Semua Cabang ({branches.length})</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Metode Bayar:</span>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-205 text-xs rounded-lg text-slate-800 cursor-pointer outline-none"
              >
                <option value="all">Semua Metode</option>
                <option value="Tunai">Tunai / Cash</option>
                <option value="QRIS">QRIS Cloud Pay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Total Omset */}
        <div className="bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 p-5 rounded-2xl text-white flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Total Pendapatan</span>
            <span className="font-mono text-xl font-bold block mt-1 tracking-tight text-emerald-300">
              {formatRupiah(totalSales)}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>PPN 10% Terhitung</span>
          </div>
        </div>

        {/* order volumes & ticket summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Transaksi & Unit</span>
            <span className="text-xl font-display font-extrabold text-slate-850 mt-1 block">
              {filteredTxs.length} Nota <span className="text-xs text-slate-400 font-normal">({totalItemCount} pcs)</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Rata-rata/Nota:</span>
            <span className="font-mono font-bold text-slate-800">{formatRupiah(averageTicket)}</span>
          </div>
        </div>

      </div>

      {/* Main List and Viewing receipt side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction History Rows (Requirement 6: visual terlihat jelas) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-705 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" /> Log Nota Penjualan ({filteredTxs.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Bulan Juni 2026</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTxs.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setViewingTx(tx)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition duration-150 ${
                  viewingTx?.id === tx.id ? 'bg-slate-50 ring-2 ring-emerald-500/10' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    tx.paymentMethod === 'QRIS' ? 'bg-blue-50 text-blue-650' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800 tracking-wide">
                        {tx.invoiceNumber}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-sans text-[9px] rounded font-semibold truncate max-w-[120px]">
                        {tx.branchName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-[10.5px] text-slate-400">
                      <span>{formatDateString(tx.timestamp)}</span>
                      <span>•</span>
                      <span>{tx.items.length} Menu</span>
                      <span>•</span>
                      <span className="font-medium text-slate-500">Kasir: {tx.cashierName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-800 block">
                      {formatRupiah(tx.totalAmount)}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${
                      tx.paymentMethod === 'QRIS' ? 'text-blue-600' : 'text-emerald-700'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}

            {filteredTxs.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold">Belum ada rekam transaksi penyelesaian.</p>
                <p className="text-[10px] text-slate-450 mt-1">Masukkan item dan lunas-pembayaran di kasir.</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected receipt View card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-250 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-emerald-650" /> Detail Faktur
            </span>
            {viewingTx && (
              <button
                onClick={() => setViewingTx(null)}
                className="text-[10.5px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Tutup
              </button>
            )}
          </div>

          {viewingTx ? (
            /* Selected invoice output */
            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-4">
              <div className="text-center font-mono space-y-1 pb-3 border-b border-dashed border-slate-200">
                <span className="text-[14px] font-bold text-slate-900 block font-sans">nusaPOS cloud</span>
                <span className="text-[10px] text-slate-400 block leading-tight">{viewingTx.branchName}</span>
                <span className="text-[9.5px] text-slate-430 px-2 py-0.5 bg-slate-50 border border-slate-150 rounded font-semibold inline-block font-sans mt-1">
                  Metode: {viewingTx.paymentMethod}
                </span>
              </div>

              {/* invoice properties */}
              <div className="text-[10.5px] font-mono text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>No Invoice:</span>
                  <span className="font-bold text-slate-800">{viewingTx.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu :</span>
                  <span>{formatDateString(viewingTx.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir :</span>
                  <span>{viewingTx.cashierName}</span>
                </div>
              </div>

              {/* Items listing */}
              <div className="border-t border-b border-dashed border-slate-200 py-2.5 space-y-1.5 font-mono text-[11px]">
                {viewingTx.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 gap-2">
                    <div className="flex-1">
                      <span className="block font-bold text-slate-800">{it.productName}</span>
                      <span className="text-[10px] text-slate-400">{it.quantity}x @ {formatRupiah(it.price)}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="text-xs font-mono text-right space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(viewingTx.items.reduce((a,c)=>a+c.subtotal, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN Pajak (10%):</span>
                  <span>{formatRupiah(Math.round(viewingTx.items.reduce((a,c)=>a+c.subtotal, 0) * 0.1))}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-1 text-xs">
                  <span>Total Bayar:</span>
                  <span className="text-emerald-700">{formatRupiah(viewingTx.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Bayar Tunai/Scan:</span>
                  <span>{formatRupiah(viewingTx.cashPaid)}</span>
                </div>
                {viewingTx.changeAmount > 0 && (
                  <div className="flex justify-between text-[11px] text-emerald-700">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(viewingTx.changeAmount)}</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Standby view */
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-150 p-4">
              <Receipt className="w-8 h-8 text-slate-200 mx-auto mb-1.5" />
              <p className="text-xs font-semibold">Struk Belum Terpilih</p>
              <p className="text-[10px] leading-relaxed text-slate-350 mt-1">
                Klik salah satu nota penjualan pada list riwayat di sebelah kiri untuk menampilkan rincian set pembelian.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
