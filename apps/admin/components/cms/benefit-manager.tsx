'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { StatusToggle } from './status-toggle';
import { OrderControls } from './order-controls';
import { CmsFeedback } from './cms-feedback';
import { Loader2, Plus, Trash2, ShieldCheck, Truck, RotateCcw, Headphones, CreditCard, Gift, Star } from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'ShieldCheck', icon: ShieldCheck },
  { key: 'Truck', icon: Truck },
  { key: 'RotateCcw', icon: RotateCcw },
  { key: 'Headphones', icon: Headphones },
  { key: 'CreditCard', icon: CreditCard },
  { key: 'Gift', icon: Gift },
  { key: 'Star', icon: Star },
];

export function BenefitManager() {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });
  const [adding, setAdding] = useState(false);
  
  const [newBenefit, setNewBenefit] = useState({ title: '', description: '', icon: 'ShieldCheck', isActive: true });

  const fetchBenefits = async () => {
    try {
      const data = await adminFetch('/admin/homepage/benefits');
      setBenefits(data);
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const handleAdd = async () => {
    if (!newBenefit.title) return;
    try {
      const result = await adminFetch('/admin/homepage/benefits', {
        method: 'POST',
        body: JSON.stringify({ ...newBenefit, sortOrder: benefits.length }),
      });
      setBenefits([...benefits, result]);
      setAdding(false);
      setNewBenefit({ title: '', description: '', icon: 'ShieldCheck', isActive: true });
      setFeedback({ message: 'Đã thêm cam kết', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await adminFetch(`/admin/homepage/benefits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setBenefits(benefits.map(b => b.id === id ? { ...b, ...data } : b));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cam kết này?')) return;
    try {
      await adminFetch(`/admin/homepage/benefits/${id}`, { method: 'DELETE' });
      setBenefits(benefits.filter(b => b.id !== id));
      setFeedback({ message: 'Đã xóa cam kết', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newBenefits = [...benefits];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBenefits[index], newBenefits[targetIndex]] = [newBenefits[targetIndex], newBenefits[index]];
    
    setBenefits(newBenefits);

    try {
      await Promise.all([
        adminFetch(`/admin/homepage/benefits/${newBenefits[index].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: index }),
        }),
        adminFetch(`/admin/homepage/benefits/${newBenefits[targetIndex].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: targetIndex }),
        }),
      ]);
      setFeedback({ message: 'Đã cập nhật thứ tự', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
      fetchBenefits();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2B4C] text-[#E5C37A] rounded-md font-medium hover:bg-[#253A66] transition-colors"
          >
            <Plus className="h-4 w-4" /> Thêm cam kết
          </button>
        ) : (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-lg w-full max-w-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Cam kết dịch vụ mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={newBenefit.title}
                  onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="Ví dụ: Giao hàng hỏa tốc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biểu tượng (Icon)</label>
                <select
                  value={newBenefit.icon}
                  onChange={(e) => setNewBenefit({ ...newBenefit, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                >
                  {ICON_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.key}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
              <input
                type="text"
                required
                value={newBenefit.description}
                onChange={(e) => setNewBenefit({ ...newBenefit, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                placeholder="Ví dụ: Trong vòng 2h tại TP.HCM"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setAdding(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                disabled={!newBenefit.title || !newBenefit.description}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Lưu cam kết
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = ICON_OPTIONS.find(o => o.key === benefit.icon)?.icon || ShieldCheck;
          return (
            <div key={benefit.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 relative group hover:border-blue-200 transition-all">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 leading-tight">{benefit.title}</div>
                <div className="text-xs text-slate-500 mt-1.5 line-clamp-2">{benefit.description}</div>
              </div>
              
              <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm z-10 -mr-2">
                <StatusToggle
                  isActive={benefit.isActive}
                  onToggle={(active) => handleUpdate(benefit.id, { isActive: active })}
                />
                <OrderControls
                  isFirst={index === 0}
                  isLast={index === benefits.length - 1}
                  onMoveUp={() => handleMove(index, 'up')}
                  onMoveDown={() => handleMove(index, 'down')}
                />
                <button
                  onClick={() => handleRemove(benefit.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {benefits.length === 0 && !adding && (
          <div className="col-span-full py-12 text-center text-slate-500 italic bg-white rounded-lg border border-slate-200 border-dashed font-medium">
            Chưa có cam kết dịch vụ nào.
          </div>
        )}
      </div>

      <CmsFeedback
        message={feedback.message}
        type={feedback.type}
        onClear={() => setFeedback({ ...feedback, message: '' })}
      />
    </div>
  );
}
