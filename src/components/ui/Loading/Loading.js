// components/common/Loading.js
import React from 'react';
import styles from './Loading.module.css';

/**
 * Componente de carregamento que segue o design system Blip
 * @param {Object} props - Propriedades do componente
 * @param {string} props.size - Tamanho do spinner: 'small', 'medium' (default), 'large'
 * @param {string} props.color - Cor do spinner: 'primary' (default), 'light', 'dark'
 * @param {string} props.message - Mensagem opcional de carregamento
 * @param {boolean} props.fullScreen - Se deve cobrir toda a tela
 * @returns {JSX.Element} Componente de carregamento
 */
const Loading = ({ 
  size = 'medium', 
  color = 'primary', 
  message,
  fullScreen = false
}) => {
  const containerClasses = `${styles.container} ${fullScreen ? styles.fullScreen : ''}`;
  const spinnerClasses = `${styles.spinner} ${styles[`size-${size}`]} ${styles[`color-${color}`]}`;
  
  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <div className={spinnerClasses}>
          <div className={styles.circle}></div>
        </div>
        
        {message && (
          <div className={styles.message}>{message}</div>
        )}
      </div>
    </div>
  );
};

export default Loading;