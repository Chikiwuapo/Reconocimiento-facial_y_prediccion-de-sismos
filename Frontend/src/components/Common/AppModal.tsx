import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from '../../styles/AppModal.module.css';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const AppModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  primaryActionLabel,
  onPrimaryAction,
  size = 'md',
}) => {
  const { theme } = useTheme();

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Tamaños del modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className={styles.overlay}>
      <div 
        className={styles.backdrop} 
        onClick={onClose}
        role="presentation"
        data-theme={theme}
      />
      <div 
        className={`${styles.modal} ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        data-theme={theme}
      >
        {title && (
          <div className={styles.header}>
            <h3 id="modal-title" className={styles.title}>
              {title}
            </h3>
            <button 
              type="button" 
              className={styles.closeButton}
              onClick={onClose} 
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className={styles.content}>
          {children}
        </div>
        
        <div className={styles.footer}>
          <button 
            type="button" 
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onClose}
          >
            Cerrar
          </button>
          
          {primaryActionLabel && onPrimaryAction && (
            <button 
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppModal;
