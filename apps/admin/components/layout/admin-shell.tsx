'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Admin</p>
          <p className="text-sm font-bold text-slate-950">HUNG HIEN</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
          aria-label="Mở menu quản trị"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu quản trị"
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-slate-950">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-white"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
