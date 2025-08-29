import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

const AppModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-lg shadow-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label="Cerrar modal">✕</button>
        </div>
        <div className="px-4 py-4">{children}</div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cerrar
          </button>
          {primaryActionLabel && onPrimaryAction && (
            <button onClick={onPrimaryAction} className="px-3 py-1.5 rounded-md text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
              {primaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppModal;
