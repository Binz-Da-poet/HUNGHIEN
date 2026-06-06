'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { StatusToggle } from './status-toggle';
import { OrderControls } from './order-controls';
import { CmsFeedback } from './cms-feedback';
import { ImageUploadField } from './image-upload-field';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export function BrandManager() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });
  const [adding, setAdding] = useState(false);
  
  const [newBrand, setNewBrand] = useState({ name: '', logoUrl: '', targetUrl: '', isActive: true });

  const fetchBrands = async () => {
    try {
      const data = await adminFetch('/admin/homepage/brands');
      setBrands(data);
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAdd = async () => {
    if (!newBrand.name || !newBrand.logoUrl) return;
    try {
      const result = await adminFetch('/admin/homepage/brands', {
        method: 'POST',
        body: JSON.stringify({ ...newBrand, sortOrder: brands.length }),
      });
      setBrands([...brands, result]);
      setAdding(false);
      setNewBrand({ name: '', logoUrl: '', targetUrl: '', isActive: true });
      setFeedback({ message: 'Đã thêm thương hiệu', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await adminFetch(`/admin/homepage/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setBrands(brands.map(b => b.id === id ? { ...b, ...data } : b));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
    try {
      await adminFetch(`/admin/homepage/brands/${id}`, { method: 'DELETE' });
      setBrands(brands.filter(b => b.id !== id));
      setFeedback({ message: 'Đã xóa thương hiệu', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newBrands = [...brands];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBrands[index], newBrands[targetIndex]] = [newBrands[targetIndex], newBrands[index]];
    
    setBrands(newBrands);

    try {
      await Promise.all([
        adminFetch(`/admin/homepage/brands/${newBrands[index].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: index }),
        }),
        adminFetch(`/admin/homepage/brands/${newBrands[targetIndex].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: targetIndex }),
        }),
      ]);
      setFeedback({ message: 'Đã cập nhật thứ tự', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
      fetchBrands();
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
            <Plus className="h-4 w-4" /> Thêm thương hiệu
          </button>
        ) : (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-lg w-full max-w-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Thương hiệu mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên thương hiệu</label>
                <input
                  type="text"
                  required
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="Ví dụ: Sony, Samsung..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link liên kết (Tùy chọn)</label>
                <input
                  type="text"
                  value={newBrand.targetUrl}
                  onChange={(e) => setNewBrand({ ...newBrand, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="/collections/sony"
                />
              </div>
            </div>
            <ImageUploadField
              label="Logo thương hiệu"
              namespace="brands"
              value={newBrand.logoUrl}
              onChange={(url) => setNewBrand({ ...newBrand, logoUrl: url })}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setAdding(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                disabled={!newBrand.name || !newBrand.logoUrl}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Lưu thương hiệu
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand, index) => (
          <div key={brand.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 relative group hover:border-blue-200 transition-all">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm z-10">
              <StatusToggle
                isActive={brand.isActive}
                onToggle={(active) => handleUpdate(brand.id, { isActive: active })}
              />
              <button
                onClick={() => handleRemove(brand.id)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <OrderControls
                isFirst={index === 0}
                isLast={index === brands.length - 1}
                onMoveUp={() => handleMove(index, 'up')}
                onMoveDown={() => handleMove(index, 'down')}
              />
            </div>
            
            <div className="h-20 w-full flex items-center justify-center p-3 border border-slate-50 rounded-md bg-slate-50/30">
              <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
            <div className="font-bold text-xs text-slate-900 truncate w-full">{brand.name}</div>
          </div>
        ))}
        {brands.length === 0 && !adding && (
          <div className="col-span-full py-12 text-center text-slate-500 italic bg-white rounded-lg border border-slate-200 border-dashed font-medium">
            Chưa có thương hiệu nào.
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
