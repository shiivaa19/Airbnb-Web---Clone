'use client';

import React from 'react';
import { useToastStore } from '../../store/toast-store';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const iconMap = {
    success: <CheckCircle className="text-emerald-500 shrink-0" size={16} />,
    error: <AlertCircle className="text-red-500 shrink-0" size={16} />,
    info: <Info className="text-blue-500 shrink-0" size={16} />,
  };

  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
              pointer-events-auto flex items-center justify-between gap-4 p-4 rounded-xl shadow-lg border
              bg-white dark:bg-[#1C1C1E] border-neutral-100 dark:border-neutral-800 text-sm font-semibold
              text-neutral-800 dark:text-white
            `}
          >
            <div className="flex items-center gap-3">
              {iconMap[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
