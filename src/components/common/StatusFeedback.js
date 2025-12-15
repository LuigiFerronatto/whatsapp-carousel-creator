// components/common/StatusFeedback.js
import React from 'react';
import { FiCheck, FiInfo, FiAlertTriangle, FiX, FiSave, FiClock } from 'react-icons/fi';
import styles from './StatusFeedback.module.css';

/**
 * Componente para exibir feedback sobre o status do sistema
 * @param {Object} props Propriedades do componente
 * @param {string} props.error Mensagem de erro, se houver
 * @param {string} props.success Mensagem de sucesso, se houver
 * @param {Object} props.validationErrors Objeto com erros de validação
 * @param {boolean} props.unsavedChanges Flag indicando se há alterações não salvas
 * @param {Date} props.lastSavedTime Data da última vez que o rascunho foi salvo
 * @param {Function} props.onSave Função para salvar manualmente
 * @param {Function} props.onClearError Função para limpar mensagens de erro
 * @returns {JSX.Element} Componente de feedback
 */
const StatusFeedback = ({ 
  error, 
  success, 
  validationErrors, 
  unsavedChanges, 
  lastSavedTime, 
  onSave, 
  onClearError 
}) => {
  // Verificar se há algum tipo de feedback para mostrar
  const hasError = !!error;
  const hasSuccess = !!success;
  const hasValidationErrors = Object.keys(validationErrors || {}).length > 0;
  
  // Se não houver nenhum feedback, não renderizar nada
  if (!hasError && !hasSuccess && !hasValidationErrors && !unsavedChanges && !lastSavedTime) {
    return null;
  }
  
  // Formatar a data da última salvamento
  const formatLastSavedTime = () => {
    if (!lastSavedTime) return '';
    
    const now = new Date();
    const diff = now - lastSavedTime;
    
    // Se for menos de um minuto
    if (diff < 60000) {
      return 'agora mesmo';
    }
    
    // Se for menos de uma hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    // Se for menos de um dia
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    // Se for mais de um dia
    const date = lastSavedTime.toLocaleDateString();
    const time = lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `em ${date} às ${time}`;
  };

  return (
    <div className={styles.container}>
      {hasError && (
        <div className={`${styles.message} ${styles.error}`}>
          <div className={styles.iconContainer}>
            <FiAlertTriangle size={18} />
          </div>
          <div className={styles.content}>
            <p>{error}</p>
          </div>
          {onClearError && (
            <button 
              className={styles.closeButton} 
              onClick={onClearError}
              aria-label="Fechar mensagem de erro"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      )}

      {hasSuccess && (
        <div className={`${styles.message} ${styles.success}`}>
          <div className={styles.iconContainer}>
            <FiCheck size={18} />
          </div>
          <div className={styles.content}>
            <p>{success}</p>
          </div>
        </div>
      )}
      
      {hasValidationErrors && (
        <div className={`${styles.message} ${styles.validation}`}>
          <div className={styles.iconContainer}>
            <FiInfo size={18} />
          </div>
          <div className={styles.content}>
            <p className={styles.validationTitle}>Por favor, corrija os seguintes erros:</p>
            <ul className={styles.validationList}>
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {(unsavedChanges || lastSavedTime) && (
        <div className={`${styles.statusBar} ${unsavedChanges ? styles.unsaved : ''}`}>
          <div className={styles.statusInfo}>
            {unsavedChanges ? (
              <>
                <FiClock size={14} className={styles.statusIcon} />
                <span>Alterações não salvas</span>
              </>
            ) : (
              <>
                <FiCheck size={14} className={styles.statusIcon} />
                <span>Salvo {formatLastSavedTime()}</span>
              </>
            )}
          </div>
          
          {onSave && (
            <button 
              className={styles.saveButton} 
              onClick={onSave}
              aria-label="Salvar rascunho"
              disabled={!unsavedChanges}
            >
              <FiSave size={14} />
              <span>Salvar</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusFeedback;