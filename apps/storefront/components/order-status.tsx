import React from 'react';
import { PublicOrderSummary } from '@repo/shared';
import { Banknote } from 'lucide-react';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const paymentLabel: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn tiền',
};

const paymentColor: Record<string, string> = {
  UNPAID: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
};

function StatusBadge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

export function OrderStatus({ order }: { order: PublicOrderSummary }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-slate-800 text-lg">
          Đơn hàng <span className="text-[#1A2B4C]">{order.publicCode}</span>
        </h3>
        <StatusBadge label={statusLabel[order.status] || order.status} color={statusColor[order.status] || 'bg-slate-100'} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-500">Khách hàng:</span>
          <p className="font-medium">{order.customerName}</p>
        </div>
        <div>
          <span className="text-slate-500">Điện thoại:</span>
          <p className="font-medium">{order.phone}</p>
        </div>
        <div className="col-span-2">
          <span className="text-slate-500">Địa chỉ:</span>
          <p className="font-medium">{order.address}</p>
        </div>
        <div>
          <span className="text-slate-500">Thanh toán:</span>
          <p className="font-medium">
            {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Trạng thái TT:</span>
          <div className="mt-0.5">
            <StatusBadge
              label={paymentLabel[order.paymentStatus] || order.paymentStatus}
              color={paymentColor[order.paymentStatus] || 'bg-slate-100'}
            />
          </div>
        </div>
      </div>

      {order.note && (
        <div className="text-sm">
          <span className="text-slate-500">Ghi chú:</span>
          <p className="italic">{order.note}</p>
        </div>
      )}

      {/* Items */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Sản phẩm</h4>
        <div className="space-y-1.5">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
              <span>{item.productName} x{item.quantity}</span>
              <span className="font-medium">{(item.priceAtPurchase).toLocaleString('vi-VN')} ₫</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-slate-200 pt-3">
        <span className="font-semibold text-slate-700">Tổng cộng</span>
        <span className="text-lg font-bold text-[#D10024]">{order.totalAmount.toLocaleString('vi-VN')} ₫</span>
      </div>

      {/* Bank transfer info */}
      {order.bankTransfer && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
            <Banknote className="h-4 w-4" /> Thông tin chuyển khoản
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-slate-500">Ngân hàng:</span> {order.bankTransfer.bankName}</p>
            <p><span className="text-slate-500">Số TK:</span> <span className="font-mono font-bold">{order.bankTransfer.bankAccountNumber}</span></p>
            <p><span className="text-slate-500">Chủ TK:</span> {order.bankTransfer.bankAccountHolder}</p>
            <p><span className="text-slate-500">Nội dung:</span> <span className="font-mono text-xs bg-white px-1 py-0.5 rounded border">{order.bankTransfer.transferContent}</span></p>
            {order.bankTransfer.instructions && (
              <p className="text-slate-600 italic mt-2">{order.bankTransfer.instructions}</p>
            )}
          </div>
          {order.bankTransfer.qrImageUrl && (
            <div className="flex justify-center mt-3">
              <img src={order.bankTransfer.qrImageUrl} alt="QR chuyển khoản" className="w-48 h-48 object-contain rounded-lg border" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
