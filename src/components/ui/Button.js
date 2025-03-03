// components/ui/Button.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/**
 * Componente de botão padronizado para toda a aplicação
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Componente de botão
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
  // Construir classes CSS com base nas props
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
    <span className={styles.loadingSpinner} aria-hidden="true">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
    </span>
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...restProps}
    >
      {loading && <LoadingSpinner />}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children && <span className={styles.text}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['solid', 'outline', 'text']),
  color: PropTypes.oneOf(['primary', 'content', 'positive', 'negative']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;