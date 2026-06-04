'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      showToast(nextMessage: string) {
        setMessage(nextMessage);
        window.setTimeout(() => setMessage(null), 2200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-md bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-4 sm:w-80">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within ToastProvider');
  return value;
}
