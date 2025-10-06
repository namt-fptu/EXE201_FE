"use client";

import React from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title = "Confirm",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-dark rounded-[10px] border border-stroke dark:border-dark-3 shadow-1 dark:shadow-card">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="rounded-[7px] border border-stroke bg-gray-2 px-4 py-2 text-dark transition hover:border-gray-3 hover:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-gray dark:hover:bg-gray"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-[7px] px-4 py-2 font-medium text-white transition ${
                isDestructive ? "bg-red hover:bg-red/90" : "bg-primary hover:bg-blue-dark"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}