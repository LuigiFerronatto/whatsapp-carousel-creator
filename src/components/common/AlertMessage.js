// components/common/AlertMessage.js
import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import styles from './AlertMessage.module.css';

/**
 * Componente melhorado de alertas e mensagens de status
 * Simplifica o uso comum de mensagens de alerta, erro, sucesso e informação
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.error - Mensagem de erro (se houver)
 * @param {string} props.success - Mensagem de sucesso (se houver)
 * @param {string} props.info - Mensagem informativa (se houver)
 * @param {string} props.warning - Mensagem de aviso (se houver)
 * @param {Function} props.onClose - Callback quando o alerta é fechado
 * @param {boolean} props.autoClose - Se o alerta deve fechar automaticamente
 * @param {number} props.autoCloseDelay - Tempo para fechar automaticamente (ms)
 * @returns {JSX.Element|null} Componente de alerta ou null se não houver mensagem
 */
const AlertMessage = ({ 
  error, 
  success, 
  info, 
  warning, 
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  className = ''
}) => {
  const [visible, setVisible] = useState(true);
  
  // Auto-close functionality
  useEffect(() => {
    if (autoClose && (error || success || info || warning)) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, error, success, info, warning, onClose]);

  // Se não tiver mensagem ou não estiver visível, não renderiza
  if (!visible || (!error && !success && !info && !warning)) {
    return null;
  }

  // Determinar o tipo de alerta
  let alertType = 'info';
  let message = info;
  let title = 'Informação';

  if (error) {
    alertType = 'error';
    message = error;
    title = 'Erro';
  } else if (warning) {
    alertType = 'warning';
    message = warning;
    title = 'Atenção';
  } else if (success) {
    alertType = 'success';
    message = success;
    title = 'Sucesso';
  }

  // Obter ícone apropriado
  const getIcon = () => {
    switch (alertType) {
      case 'error':
      case 'warning':
        return <FiAlertTriangle className={styles.icon} />;
      case 'success':
        return <FiCheckCircle className={styles.icon} />;
      case 'info':
      default:
        return <FiInfo className={styles.icon} />;
    }
  };
  
  // Função para fechar o alerta
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Classes dinâmicas
  const alertClasses = `
    ${styles.container} 
    ${styles[alertType]} 
    ${visible ? styles.visible : styles.hidden}
    ${className}
  `.trim();

  return (
    <div 
      className={alertClasses}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          {getIcon()}
        </div>
        <div className={styles.messageContainer}>
          <div className={styles.title}>{title}</div>
          <div className={styles.message}>{message}</div>
        </div>
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

export default AlertMessage;