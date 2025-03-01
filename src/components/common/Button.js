// components/common/Button.js
import React from 'react';
import styles from './Button.module.css';

/**
 * Componente de botão que segue o design system Blip
 * @param {Object} props - Propriedades do componente
 * @param {string} props.variant - Variante do botão: 'solid' (default), 'outline', 'text'
 * @param {string} props.color - Cor do botão: 'primary' (default), 'content', 'positive', 'negative'
 * @param {string} props.size - Tamanho do botão: 'medium' (default), 'large'
 * @param {boolean} props.loading - Indica se o botão está em estado de carregamento
 * @param {string} props.iconLeft - Ícone a ser exibido à esquerda do texto (opcional)
 * @param {string} props.iconRight - Ícone a ser exibido à direita do texto (opcional)
 * @param {boolean} props.disabled - Indica se o botão está desabilitado
 * @param {Function} props.onClick - Função de callback ao clicar no botão
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @returns {JSX.Element} Componente de botão
 */
const Button = ({
  variant = 'solid',
  color = 'primary',
  size = 'medium',
  loading = false,
  iconLeft,
  iconRight,
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    styles[`size-${size}`],
    loading && styles.loading,
    disabled && styles.disabled
  ].filter(Boolean).join(' ');

  // Renderizar o ícone de loading
  const renderLoadingIcon = () => (
    <svg className={styles.loadingIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle className={styles.loadingCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );

  // Renderizar ícone à esquerda
  const renderLeftIcon = () => {
    if (loading) {
      return renderLoadingIcon();
    }
    
    if (iconLeft) {
      return <span className={styles.iconLeft}>{iconLeft}</span>;
    }
    
    return null;
  };

  // Renderizar ícone à direita
  const renderRightIcon = () => {
    if (iconRight) {
      return <span className={styles.iconRight}>{iconRight}</span>;
    }
    
    return null;
  };

  return (
    <button
      className={buttonClasses}
      onClick={!loading && !disabled ? onClick : undefined}
      disabled={loading || disabled}
      {...props}
    >
      {renderLeftIcon()}
      {children && <span className={styles.text}>{children}</span>}
      {renderRightIcon()}
    </button>
  );
};

export default Button;