// components/common/EmptyState.js
import React from 'react';
import styles from './EmptyState.module.css';

/**
 * Componente para exibir estados vazios seguindo o Design System Blip
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Título do estado vazio
 * @param {string} props.description - Descrição do que fazer para preencher o estado vazio
 * @param {React.ReactNode} props.icon - Ícone personalizado para o estado vazio
 * @param {string} props.imageUrl - URL para uma imagem personalizada
 * @param {string} props.type - Tipo do estado vazio: 'first-access', 'post-action', 'no-results', 'error'
 * @param {Function} props.primaryAction - Função para executar a ação primária
 * @param {string} props.primaryActionLabel - Texto do botão de ação primária
 * @param {Function} props.secondaryAction - Função para executar a ação secundária
 * @param {string} props.secondaryActionLabel - Texto do link de ação secundária
 * @param {boolean} props.fullPage - Se deve ocupar toda a página
 * @returns {JSX.Element} Componente de estado vazio
 */
const EmptyState = ({
  title,
  description,
  icon,
  imageUrl,
  type = 'first-access',
  primaryAction,
  primaryActionLabel,
  secondaryAction,
  secondaryActionLabel,
  fullPage = false
}) => {
  // Função para renderizar ícone padrão baseado no tipo
  const renderDefaultIcon = () => {
    switch (type) {
      case 'no-results':
        return (
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case 'error':
        return (
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'post-action':
        return (
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default: // 'first-access'
        return (
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.content}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className={styles.image} />
        ) : (
          <div className={styles.iconContainer}>
            {icon || renderDefaultIcon()}
          </div>
        )}
        
        <h3 className={styles.title}>{title}</h3>
        
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        <div className={styles.actions}>
          {primaryAction && primaryActionLabel && (
            <button 
              className={styles.primaryAction}
              onClick={primaryAction}
            >
              {primaryActionLabel}
            </button>
          )}
          
          {secondaryAction && secondaryActionLabel && (
            <button 
              className={styles.secondaryAction}
              onClick={secondaryAction}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;