// components/common/AlertMessage.js
import React from 'react';
import styles from './AlertMessage.module.css';

/**
 * Componente de alerta que segue o design system Blip
 * @param {Object} props - Propriedades do componente
 * @param {string} props.error - Mensagem de erro (se houver)
 * @param {string} props.success - Mensagem de sucesso (se houver)
 * @param {string} props.info - Mensagem informativa (se houver)
 * @param {string} props.warning - Mensagem de aviso (se houver)
 * @param {Function} props.onClose - Função de callback quando o alerta é fechado
 * @returns {JSX.Element|null} Componente de alerta ou null se não houver mensagem
 */
const AlertMessage = ({ error, success, info, warning, onClose }) => {
  // Se não houver nenhuma mensagem, não renderizar nada
  if (!error && !success && !info && !warning) {
    return null;
  }

  // Determinar o tipo de alerta e sua mensagem
  let alertType = 'info';
  let message = info;

  if (error) {
    alertType = 'error';
    message = error;
  } else if (warning) {
    alertType = 'warning';
    message = warning;
  } else if (success) {
    alertType = 'success';
    message = success;
  }

  // Selecionar o ícone apropriado baseado no tipo
  const getIcon = () => {
    switch (alertType) {
      case 'error':
        return (
          <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 6C10.5523 6 11 6.44772 11 7V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V7C9 6.44772 9.44772 6 10 6ZM10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14Z" fill="currentColor"/>
          </svg>
        );
      case 'warning':
        return (
          <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.4572 3.09327C9.24986 1.77591 11.1468 1.77591 11.9394 3.09327L18.3803 13.7506C19.1729 15.068 18.2245 16.75 16.7392 16.75H3.65746C2.17209 16.75 1.22369 15.068 2.01635 13.7506L8.4572 3.09327ZM10 6C10.5523 6 11 6.44772 11 7V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V7C9 6.44772 9.44772 6 10 6ZM10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14Z" fill="currentColor"/>
          </svg>
        );
      case 'success':
        return (
          <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM14.7071 8.70711C15.0976 8.31658 15.0976 7.68342 14.7071 7.29289C14.3166 6.90237 13.6834 6.90237 13.2929 7.29289L9 11.5858L7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L8.29289 13.7071C8.68342 14.0976 9.31658 14.0976 9.70711 13.7071L14.7071 8.70711Z" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 6C10.5523 6 11 6.44772 11 7V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V7C9 6.44772 9.44772 6 10 6ZM10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  return (
    <div className={`${styles.container} ${styles[alertType]}`} role="alert">
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          {getIcon()}
        </div>
        <div className={styles.messageContainer}>
          <div className={styles.title}>
            {alertType === 'error' && 'Erro'}
            {alertType === 'warning' && 'Atenção'}
            {alertType === 'success' && 'Sucesso'}
            {alertType === 'info' && 'Informação'}
          </div>
          <div className={styles.message}>{message}</div>
        </div>
      </div>
      {onClose && (
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Fechar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AlertMessage;