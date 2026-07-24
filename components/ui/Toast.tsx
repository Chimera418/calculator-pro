"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, Sparkles } from "lucide-react";

export type ToastVariant = "info" | "success" | "error" | "social";

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, duration: 4000, ...t };
      setToasts((prev) => [...prev, item]);
      window.setTimeout(() => remove(id), item.duration);
    },
    [remove],
  );

  const social = toasts.filter((t) => t.variant === "social");
  const system = toasts.filter((t) => t.variant !== "social");

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Social proof — bottom left */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-[60] flex w-72 flex-col gap-2">
        <AnimatePresence initial={false}>
          {social.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* System — bottom right */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
        <AnimatePresence initial={false}>
          {system.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />,
  error: <XCircle className="h-5 w-5 text-[var(--danger)]" />,
  info: <Info className="h-5 w-5 text-[var(--accent)]" />,
  social: <Sparkles className="h-4 w-4 text-[var(--accent)]" />,
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClose}
      className="pointer-events-auto flex cursor-default items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]"
    >
      <div className="mt-0.5 shrink-0">{ICONS[toast.variant]}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--fg)]">{toast.message}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-[var(--muted)]">{toast.description}</p>
        )}
      </div>
    </motion.div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}