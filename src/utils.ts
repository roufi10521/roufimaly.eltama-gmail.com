/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateInvoiceNumber(branchPrefix: string = 'NP'): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${branchPrefix}-${yy}${mm}${dd}-${randomPart}`;
}

export function formatDateString(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
}
