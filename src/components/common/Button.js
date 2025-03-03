// components/common/Button.js
import React from 'react';
import styles from './Button.module.css';

/**
 * Componente Button aprimorado e reutilizável
 * Projetado para ser usado em toda a aplicação com estilos consistentes
 */
const Button = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  onClick,
  ...restProps
}) => {
  // Construir classes de CSS de forma dinâmica
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    styles[`size-${size}`],
    disabled ? styles.disabled : '',
    loading ? styles.loading : '',
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');
  
  // Componente de carregamento
  const LoadingSpinner = () => (
    <div className={styles.loadingIcon}>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle className={styles.loadingCircle} cx="12" cy="12" r="10" 
          stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
    </div>
  );
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={!loading && !disabled ? onClick : undefined}
      {...restProps}
    >
      {loading && <LoadingSpinner />}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children && <span className={styles.text}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

export default Button;