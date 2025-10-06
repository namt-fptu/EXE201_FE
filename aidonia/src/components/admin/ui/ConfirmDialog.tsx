"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-dark rounded-[10px] border border-stroke dark:border-dark-3 shadow-1 dark:shadow-card">
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 ${
            isDestructive 
              ? 'bg-red/10' 
              : 'bg-[#3C50E0]/10'
          }`}>
            {isDestructive ? (
              <svg className="h-6 w-6 text-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-[#3C50E0]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-body font-medium mb-6">
              {message}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 justify-center rounded-[7px] border border-stroke bg-gray-2 px-6 py-2.5 text-dark transition hover:border-gray-3 hover:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-gray dark:hover:bg-gray"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 justify-center rounded-[7px] px-6 py-2.5 font-medium text-white transition ${
                isDestructive
                  ? 'bg-red hover:bg-red/90'
                  : 'bg-primary hover:bg-blue-dark'
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