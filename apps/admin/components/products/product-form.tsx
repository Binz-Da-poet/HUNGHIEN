'use client';

import React, { useState, useEffect } from 'react';
import { ProductImage, ProductImageManager } from './product-image-manager';
import { adminFetch } from '@/lib/admin-api';

interface Product {
  id?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  brand: string;
  stock: number;
  categoryId: string;
  description?: string;
  images?: ProductImage[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'images'>>({
    name: '',
    slug: '',
    price: 0,
    originalPrice: 0,
    brand: '',
    stock: 0,
    categoryId: '',
    description: '',
  });
  
  const [images, setImages] = useState<ProductImage[]>(initialData?.images ?? []);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const data = await adminFetch('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        price: initialData.price,
        originalPrice: initialData.originalPrice || 0,
        brand: initialData.brand,
        stock: initialData.stock,
        categoryId: initialData.categoryId,
        description: initialData.description || '',
      });
      setImages(initialData.images ?? []);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate slug from name if it's a new product
      if (name === 'name' && !initialData) {
        updated.slug = value.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
      }
      
      // Handle number inputs
      if (name === 'price' || name === 'originalPrice' || name === 'stock') {
        updated[name as keyof typeof updated] = Number(value) as never;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">
          {initialData ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Đường dẫn</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Giá bán</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Giá gốc</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Thương hiệu</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Tồn kho</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Danh mục</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              required
            >
              <option value="" disabled>Chọn một danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none"
          >
            {initialData ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>

      <ProductImageManager
        productId={initialData?.id}
        images={images}
        onImagesChange={setImages}
      />
    </div>
  );
}
