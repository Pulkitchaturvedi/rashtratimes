'use client';

import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

export type Toast = {
  id: number;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (toast: Omit<Toast, 'id'>) => {
    const nextId = ++idCounter;
    setToasts((current) => [...current, { id: nextId, ...toast }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== nextId));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'w-72 rounded-lg border border-border bg-background p-4 shadow-lg'
            )}
          >
            <p className="font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-muted-foreground">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function Toaster() {
  return null;
}
