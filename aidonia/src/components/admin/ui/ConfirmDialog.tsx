"use client";

import { ReactNode } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red text-white hover:bg-red/90';
      case 'warning':
        return 'bg-yellow text-white hover:bg-yellow/90';
      case 'info':
        return 'bg-primary text-white hover:bg-primary/90';
      default:
        return 'bg-red text-white hover:bg-red/90';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-[10px] border border-stroke shadow-1">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-stroke bg-gray-2 text-dark rounded-lg hover:bg-gray-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getTypeStyles()}`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
