// components/ui/Feedback.js
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './Feedback.module.css';
import { createContext, useContext, useReducer } from 'react';
import { createPortal } from 'react-dom';

/**
 * Sistema de feedback para o usuário
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element|null} Componente de feedback
 */
export const Feedback = ({
  type = 'info',
  title,
  message,
  autoClose = false,
  autoCloseTime = 5000,
  onClose,
  className = '',
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Ícone com base no tipo de feedback
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.icon} />;
      case 'error':
        return <FiAlertCircle className={styles.icon} />;
      case 'warning':
        return <FiAlertCircle className={styles.icon} />;
      case 'info':
      default:
        return <FiInfo className={styles.icon} />;
    }
  };

  // Fechar automaticamente após o tempo especificado
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible, onClose]);

  // Manipular fechamento manual
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Se não estiver visível, não renderizar nada
  if (!isVisible) return null;

  const feedbackClasses = [
    styles.container,
    styles[type],
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={feedbackClasses}
      role="alert"
      {...restProps}
    >
      <div className={styles.iconContainer}>
        {getIcon()}
      </div>
      
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        {message && <div className={styles.message}>{message}</div>}
      </div>
      
      {onClose && (
        <button 
          className={styles.closeButton} 
          onClick={handleClose}
          aria-label="Fechar"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

/**
 * Toast notification system para feedback em overlay
 */
export const ToastContainer = ({ children, className = '', ...restProps }) => {
  return (
    <div className={`${styles.toastContainer} ${className}`} {...restProps}>
      {children}
    </div>
  );
};



/**
 * Contexto para gerenciar toasts globalmente
 */

const ToastContext = createContext(null);

// Reducer para gerenciar toasts
const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, { id: Date.now(), ...action.payload }];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

/**
 * Provider para sistema de toasts
 */
export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  
  const addToast = (toast) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
  };
  
  const removeToast = (id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <ToastContainer>
          {toasts.map(toast => (
            <Feedback
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
              autoClose
            />
          ))}
        </ToastContainer>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

/**
 * Hook para usar toasts em qualquer componente
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  
  return {
    /**
     * Mostrar toast de sucesso
     * @param {string} message - Mensagem do toast
     * @param {Object} options - Opções adicionais
     */
    success: (message, options = {}) => {
      context.addToast({ type: 'success', message, ...options });
    },
    
    /**
     * Mostrar toast de erro
     * @param {string} message - Mensagem do toast
     * @param {Object} options - Opções adicionais
     */
    error: (message, options = {}) => {
      context.addToast({ type: 'error', message, ...options });
    },
    
    /**
     * Mostrar toast de aviso
     * @param {string} message - Mensagem do toast
     * @param {Object} options - Opções adicionais
     */
    warning: (message, options = {}) => {
      context.addToast({ type: 'warning', message, ...options });
    },
    
    /**
     * Mostrar toast informativo
     * @param {string} message - Mensagem do toast
     * @param {Object} options - Opções adicionais
     */
    info: (message, options = {}) => {
      context.addToast({ type: 'info', message, ...options });
    }
  };
};