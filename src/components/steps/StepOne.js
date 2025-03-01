// components/StepOne.js
import React from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import StatusMessage from '../common/StatusMessage';
import styles from './StepOne.module.css';

const StepOne = ({ 
  authKey, 
  setAuthKey, 
  numCards, 
  cards, 
  updateCard, 
  handleAddCard, 
  handleRemoveCard, 
  handleUploadFiles, 
  loading, 
  error, 
  success, 
  uploadResults 
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Passo 1: Autenticação e Upload de Arquivos</h2>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Chave de Autorização (Router Key)</label>
        <input 
          type="text" 
          className={styles.input}
          value={authKey}
          onChange={(e) => setAuthKey(e.target.value)}
          placeholder="Key=xxxxxxxxx"
        />
        <p className={styles.helpText}>Necessário para o envio dos arquivos e criação do template</p>
      </div>
      
      <div className={styles.formGroup}>
        <div className={styles.cardControls}>
          <label className={styles.label}>Número de Cards ({numCards})</label>
          <div className={styles.buttonGroup}>
            <button 
              onClick={handleRemoveCard}
              disabled={numCards <= 2}
              className={styles.removeButton}
              aria-label="Remover card"
            >
              -
            </button>
            <button 
              onClick={handleAddCard}
              disabled={numCards >= 10}
              className={styles.addButton}
              aria-label="Adicionar card"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {cards.slice(0, numCards).map((card, index) => (
        <CardUploadInput 
          key={index} 
          index={index} 
          card={card} 
          updateCard={updateCard} 
        />
      ))}
      
      <div>
        <button 
          className={styles.submitButton}
          onClick={handleUploadFiles}
          disabled={loading}
        >
          {loading && (
            <svg className={styles.loadingIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Processando uploads...' : 'Enviar Arquivos e Continuar'}
        </button>
      </div>
      
      <StatusMessage error={error} success={success} />
      
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>Resumo dos uploads:</div>
          <ul className={styles.summaryList}>
            {uploadResults.map((result, idx) => (
              <li key={idx} className={styles.summaryItem}>
                Card {idx + 1}: 
                <span className={result.status === 'success' ? styles.successStatus : styles.simulatedStatus}>
                  {result.status === 'success' ? ' Enviado com sucesso' : ' Simulado para testes'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StepOne;