// components/ui/ProgressBar/ProgressBar.js
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import styles from './ProgressBar.module.css';

/**
 * ProgressBar component - Reutilizável para exibir progresso visual em diferentes contextos
 * 
 * @param {Object} props - Propriedades do componente
 * @param {number} props.value - Valor atual do progresso (0-100)
 * @param {string} props.variant - Variante visual (default, success, warning, upload, step)
 * @param {string} props.size - Tamanho da barra (small, medium, large)
 * @param {boolean} props.showLabel - Se deve exibir o valor do progresso
 * @param {string} props.label - Texto personalizado para o label (se não fornecido, mostra a porcentagem)
 * @param {boolean} props.showStatus - Se deve exibir um ícone de status
 * @param {string} props.statusVariant - Tipo de status (success, warning, error)
 * @param {string} props.statusText - Texto descritivo do status
 * @param {string} props.className - Classes CSS adicionais
 * @returns {JSX.Element} Componente ProgressBar
 */
const ProgressBar = ({
  value = 0,
  variant = 'default',
  size = 'medium',
  showLabel = true,
  label = '',
  showStatus = false,
  statusVariant = 'success',
  statusText = '',
  className = '',
  ...props
}) => {
  // Sanitizar o valor para garantir que está entre 0-100
  const sanitizedValue = Math.max(0, Math.min(100, value));
  
  // Determinar se o progresso está completo
  const isComplete = sanitizedValue >= 100;
  
  // Definir classes de acordo com as props
  const containerClasses = [
    styles.progressContainer,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className
  ].join(' ');
  
  // Obter ícone de status apropriado
  const getStatusIcon = () => {
    if (statusVariant === 'success' || isComplete) {
      return <FiCheckCircle className={styles.statusIconSuccess} />;
    }
    return <FiAlertTriangle className={styles.statusIconWarning} />;
  };
  
  return (
    <div className={containerClasses} {...props}>
      {(showLabel || statusText) && (
        <div className={styles.labelContainer}>
          {showLabel && (
            <span className={styles.progressLabel}>
              {label || `${Math.round(sanitizedValue)}%`}
            </span>
          )}
          
          {statusText && (
            <span className={`${styles.statusText} ${styles[`status${statusVariant.charAt(0).toUpperCase() + statusVariant.slice(1)}`]}`}>
              {statusText}
            </span>
          )}
        </div>
      )}
      
      <div className={styles.progressBarWrapper}>
        <div 
          className={styles.progressBar}
          role="progressbar"
          aria-valuenow={sanitizedValue}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div 
            className={styles.progressFill}
            style={{ width: `${sanitizedValue}%` }}
            data-value={`${Math.round(sanitizedValue)}%`}
          />
        </div>
        
        {showStatus && (
          <div className={styles.statusIndicator}>
            {getStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'upload', 'step']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  showStatus: PropTypes.bool,
  statusVariant: PropTypes.oneOf(['success', 'warning', 'error']),
  statusText: PropTypes.string,
  className: PropTypes.string
};

export default ProgressBar;