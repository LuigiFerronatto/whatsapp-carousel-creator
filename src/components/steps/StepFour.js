// steps/StepFour.js

import React from 'react';
import CarouselPreview from '../previews/CarouselPreview';
import StatusMessage from '../common/StatusMessage';
import styles from './StepFour.module.css';

const StepFour = ({
  finalJson,
  phoneNumber,
  setPhoneNumber,
  sendTemplate,
  resetForm,
  error,
  success,
  loading,
  cards,
  bodyText,
  setStep  // Receber como prop em vez de importar
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Passo 4: Visualização e Envio</h2>
      
      <div className={styles.previewSection}>
        <h3 className={styles.sectionTitle}>Pré-visualização do Carrossel</h3>
        <CarouselPreview cards={cards} bodyText={bodyText} />
      </div>
      
      <div className={styles.sendSection}>
        <h3 className={styles.sendTitle}>Enviar Template para WhatsApp</h3>
        <p className={styles.sendText}>Envie o template diretamente para um número de WhatsApp:</p>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Número de Telefone (com DDI)</label>
          <input 
            type="text" 
            className={styles.input}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="5521999999999"
          />
          <p className={styles.helpText}>Digite o número completo com DDI (ex: 5521999999999)</p>
        </div>
        
        <button 
          className={styles.sendButton}
          onClick={sendTemplate}
          disabled={loading}
        >
          {loading && (
            <svg className={styles.loadingIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Enviando...' : 'Enviar Template'}
        </button>
      </div>
      
      <div className={styles.navigationButtons}>
        <button 
          className={styles.backButton}
          onClick={() => setStep(3)}
        >
          Voltar
        </button>
        
        <button 
          className={styles.newTemplateButton}
          onClick={resetForm}
        >
          Criar Novo Template
        </button>
      </div>
      
      <StatusMessage error={error} success={success} />
    </div>
  );
};

export default StepFour;