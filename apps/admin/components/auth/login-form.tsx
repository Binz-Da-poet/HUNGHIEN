'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminFetch('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm p-8 bg-white rounded-lg shadow-md border border-slate-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quản trị Hùng Hiển</h1>
        <p className="text-slate-500">Đăng nhập để quản lý cửa hàng</p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#1A2B4C] text-[#E5C37A] rounded font-medium hover:bg-[#253A66] transition-colors disabled:opacity-50"
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
