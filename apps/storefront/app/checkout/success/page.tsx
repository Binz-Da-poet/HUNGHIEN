'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, ShoppingBag, FileText, Copy, Check } from 'lucide-react';
import { formatVnd } from '@/lib/format';
import { PublicOrderSummary } from '@repo/shared';
import { API_BASE_URL } from '@/lib/api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const total = searchParams.get('total');
  const payment = searchParams.get('payment');
  const [copied, setCopied] = useState(false);
  const [bankInfo, setBankInfo] = useState<PublicOrderSummary['bankTransfer'] | null>(null);

  useEffect(() => {
    if (payment === 'BANK_TRANSFER' && code) {
      // Fetch bank info from the store settings or tracking endpoint
      fetch(`${API_BASE_URL}/store-settings`)
        .then(res => res.json().catch(() => null))
        .then(data => {
          if (data?.bankAccountNumber) {
            setBankInfo({
              bankName: data.bankName || 'Ngân hàng',
              bankAccountNumber: data.bankAccountNumber,
              bankAccountHolder: data.bankAccountHolder || 'Chủ tài khoản',
              transferContent: (data.bankTransferTemplate || '{code}').replace('{code}', code),
              instructions: data.bankTransferInstructions || null,
              qrImageUrl: data.bankQrImageUrl || null,
            });
          }
        })
        .catch(() => {});
    }
  }, [code, payment]);

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600 border-2 border-green-100 shadow-sm">
          <BadgeCheck className="h-12 w-12" />
        </div>
        <h1 className="mb-4 text-4xl font-black text-[#1A2B4C] uppercase tracking-tight">Đặt hàng thành công!</h1>
        <p className="mx-auto mb-6 max-w-lg text-lg text-slate-500 font-medium leading-relaxed">
          Hùng Hiền Điện Máy đã nhận đơn hàng của bạn. Chúng tôi sẽ liên hệ xác nhận và giao hàng trong thời gian sớm nhất.
        </p>

        {code && (
          <div className="mb-10 inline-flex flex-col items-center gap-3 bg-slate-50 rounded-2xl px-8 py-6 border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mã đơn hàng</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-[#1A2B4C] font-mono tracking-tighter">{code}</span>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
              </button>
            </div>
            {total && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Tổng tiền: <span className="text-[#D10024]">{formatVnd(Number(total))}</span>
              </span>
            )}
          </div>
        )}

        {/* Bank transfer info */}
        {bankInfo && (
          <div className="mx-auto mb-10 max-w-md bg-blue-50 border border-blue-200 rounded-2xl p-6 text-left space-y-3">
            <h3 className="text-sm font-black text-blue-800 uppercase tracking-wider text-center">
              Thông tin chuyển khoản
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-bold">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <span className="font-mono font-bold text-blue-700">{bankInfo.bankAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold">{bankInfo.bankAccountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nội dung CK:</span>
                <span className="font-mono font-bold text-red-600">{bankInfo.transferContent}</span>
              </div>
            </div>
            {bankInfo.qrImageUrl && (
              <div className="flex justify-center pt-2">
                <img src={bankInfo.qrImageUrl} alt="QR chuyển khoản" className="w-40 h-40 object-contain rounded-lg border" />
              </div>
            )}
            {bankInfo.instructions && (
              <p className="text-xs text-slate-500 italic text-center">{bankInfo.instructions}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1A2B4C] px-10 text-sm font-black text-[#E5C37A] uppercase tracking-widest transition-all hover:bg-[#253A66] shadow-xl shadow-[#1A2B4C]/20 w-full sm:w-auto"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Tiếp tục mua sắm
        </Link>
        <Link
          href="/orders/tracking"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 px-10 text-sm font-black text-slate-600 uppercase tracking-widest transition-all hover:bg-slate-50 w-full sm:w-auto"
        >
          <FileText className="h-4 w-4 mr-2" />
          Theo dõi đơn hàng
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-32 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
