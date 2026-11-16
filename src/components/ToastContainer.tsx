import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 p-3.5 rounded-lg border bg-white shadow-md transition-all ${
              isSuccess
                ? 'border-[#176B50]/30'
                : isError
                ? 'border-red-300'
                : 'border-[#E4E4E0]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-[#176B50] shrink-0 mt-0.5" />
            ) : isError ? (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#17191D] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#17191D] leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#5A5F6B] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Close notification"
              className="text-[#6F7480] hover:text-[#17191D] p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
