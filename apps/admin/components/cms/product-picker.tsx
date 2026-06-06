'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { Search, Plus, X, MoveUp, MoveDown, Loader2 } from 'lucide-react';

interface ProductPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ProductPicker({ selectedIds, onChange }: ProductPickerProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSelected = async () => {
      if (selectedIds.length === 0) {
        setSelectedProducts([]);
        return;
      }
      try {
        // Fetch products by IDs
        const all = await adminFetch('/products');
        const filtered = selectedIds.map(id => all.find((p: any) => p.id === id)).filter(Boolean);
        setSelectedProducts(filtered);
      } catch (err) {
        console.error('Failed to fetch selected products', err);
      }
    };
    fetchSelected();
  }, [selectedIds.length]); // Only refetch when count changes to avoid infinite loops if objects differ

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const data = await adminFetch(`/products?search=${encodeURIComponent(search)}`);
      setResults(data.filter((p: any) => !selectedIds.includes(p.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: any) => {
    const newIds = [...selectedIds, product.id];
    onChange(newIds);
    setSelectedProducts([...selectedProducts, product]);
    setResults(results.filter(p => p.id !== product.id));
  };

  const removeProduct = (id: string) => {
    const newIds = selectedIds.filter(pid => pid !== id);
    onChange(newIds);
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...selectedProducts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    setSelectedProducts(newProducts);
    onChange(newProducts.map(p => p.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm sản phẩm theo tên..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !search.trim()}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-200 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tìm'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-2 max-h-48 overflow-y-auto space-y-1 shadow-inner">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kết quả tìm kiếm</div>
          {results.map(product => (
            <div key={product.id} className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors">
              <span className="text-sm text-slate-700">{product.name}</span>
              <button
                type="button"
                onClick={() => addProduct(product)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Thêm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sản phẩm đã chọn ({selectedProducts.length})</label>
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => { setSelectedProducts([]); onChange([]); }}
              className="text-[10px] font-bold text-red-500 uppercase hover:underline"
            >
              Xóa tất cả
            </button>
          )}
        </div>
        <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden shadow-sm">
          {selectedProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 transition-colors group">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveProduct(index, 'up')}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                >
                  <MoveUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === selectedProducts.length - 1}
                  onClick={() => moveProduct(index, 'down')}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                >
                  <MoveDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{product.name}</div>
                <div className="text-[10px] text-slate-500">{product.brand} • {product.price.toLocaleString('vi-VN')}đ</div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                title="Bỏ chọn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {selectedProducts.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-400 italic bg-slate-50/50">
              Chưa chọn sản phẩm nào. Hãy tìm kiếm và thêm sản phẩm.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
