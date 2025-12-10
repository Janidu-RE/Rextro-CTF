import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-right
              ${toast.type === 'error' 
                ? 'bg-red-900/80 border-red-500 text-white shadow-red-900/20' 
                : toast.type === 'success'
                ? 'bg-green-900/80 border-green-500 text-white shadow-green-900/20'
                : 'bg-gray-800/90 border-gray-600 text-gray-200'
              }
            `}
          >
            {toast.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
            {toast.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
            
            <span className="font-medium text-sm">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
