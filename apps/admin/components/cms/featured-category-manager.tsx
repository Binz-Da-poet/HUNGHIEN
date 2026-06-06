'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { StatusToggle } from './status-toggle';
import { OrderControls } from './order-controls';
import { CmsFeedback } from './cms-feedback';
import { ImageUploadField } from './image-upload-field';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export function FeaturedCategoryManager() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({ message: '', type: 'success' });
  const [adding, setAdding] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');

  const fetchData = async () => {
    try {
      const [fData, cData] = await Promise.all([
        adminFetch('/admin/homepage/featured-categories'),
        adminFetch('/categories'),
      ]);
      setFeatured(fData);
      setCategories(cData);
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newCategoryId) return;
    const cat = categories.find(c => c.id === newCategoryId);
    try {
      const result = await adminFetch('/admin/homepage/featured-categories', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: newCategoryId,
          displayName: cat.name,
          isActive: true,
          sortOrder: featured.length,
        }),
      });
      setFeatured([...featured, result]);
      setAdding(false);
      setNewCategoryId('');
      setFeedback({ message: 'Đã thêm danh mục nổi bật', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await adminFetch(`/admin/homepage/featured-categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setFeatured(featured.map(f => f.id === id ? { ...f, ...data } : f));
      setFeedback({ message: 'Đã cập nhật', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Bỏ danh mục này khỏi danh mục nổi bật?')) return;
    try {
      await adminFetch(`/admin/homepage/featured-categories/${id}`, { method: 'DELETE' });
      setFeatured(featured.filter(f => f.id !== id));
      setFeedback({ message: 'Đã xóa', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newFeatured = [...featured];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFeatured[index], newFeatured[targetIndex]] = [newFeatured[targetIndex], newFeatured[index]];
    
    setFeatured(newFeatured);

    try {
      await Promise.all([
        adminFetch(`/admin/homepage/featured-categories/${newFeatured[index].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: index }),
        }),
        adminFetch(`/admin/homepage/featured-categories/${newFeatured[targetIndex].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: targetIndex }),
        }),
      ]);
      setFeedback({ message: 'Đã cập nhật thứ tự', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
      fetchData();
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
            <Plus className="h-4 w-4" /> Thêm danh mục nổi bật
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm animate-in fade-in zoom-in-95">
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục...</option>
              {categories.filter(c => !featured.some(f => f.categoryId === c.id)).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!newCategoryId}
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium text-sm disabled:opacity-50 hover:bg-green-700 transition-colors"
            >
              Thêm
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((item, index) => (
          <div key={item.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <OrderControls
                  isFirst={index === 0}
                  isLast={index === featured.length - 1}
                  onMoveUp={() => handleMove(index, 'up')}
                  onMoveDown={() => handleMove(index, 'down')}
                />
                <span className="font-bold text-slate-900 text-sm truncate max-w-[120px]">
                  {item.category?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusToggle
                  isActive={item.isActive}
                  onToggle={(active) => handleUpdate(item.id, { isActive: active })}
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  value={item.displayName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFeatured(featured.map(f => f.id === item.id ? { ...f, displayName: newValue } : f));
                  }}
                  onBlur={(e) => handleUpdate(item.id, { displayName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                />
              </div>
              
              <ImageUploadField
                label="Ảnh minh họa"
                namespace="featured-categories"
                value={item.imageUrl}
                onChange={(url) => handleUpdate(item.id, { imageUrl: url })}
              />
            </div>
          </div>
        ))}
        {featured.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 italic bg-white rounded-lg border border-slate-200 border-dashed">
            Chưa có danh mục nổi bật nào.
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
