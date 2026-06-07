'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';

interface ImageUploadFieldProps {
  label: string;
  namespace: string;
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  className?: string;
}

export function ImageUploadField({ label, namespace, value, onChange, error, className }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setLocalError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const result = await adminFetch(`/admin/homepage/uploads/${namespace}`, {
        method: 'POST',
        body: formData,
      });
      onChange(result.url);
    } catch (err: any) {
      setLocalError(err.message || 'Tải ảnh lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      
      <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] bg-slate-50 overflow-hidden group">
        {value ? (
          <div className="w-full h-full flex flex-col items-center">
            <img src={value} alt="Preview" className="max-h-[140px] object-contain mb-2 rounded border border-slate-200" />
            <div className="text-[10px] text-slate-500 truncate w-full text-center px-2">{value}</div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-slate-500 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
            ) : (
              <UploadCloud className="h-8 w-8 mb-2 group-hover:text-blue-500 transition-colors" />
            )}
            <p className="text-xs font-medium group-hover:text-blue-500 transition-colors">
              {uploading ? 'Đang tải lên...' : 'Click để tải lên hoặc kéo thả'}
            </p>
            <p className="text-[10px] mt-1 italic">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</p>
          </div>
        )}
        
        {!value && (
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleUpload}
            disabled={uploading}
            accept="image/*"
          />
        )}
      </div>
      
      {(error || localError) && (
        <p className="mt-1 text-xs text-red-500">{error || localError}</p>
      )}
    </div>
  );
}
