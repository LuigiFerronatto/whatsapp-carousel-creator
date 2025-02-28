// components/StepThree.js
import React from 'react';
import StatusMessage from './StatusMessage';
import JsonViewer from './JsonViewer';
import styles from './StepThree.module.css';

const StepThree = ({
  finalJson,
  copyToClipboard,
  phoneNumber,
  setPhoneNumber,
  sendTemplate,
  resetForm,
  error,
  success,
  loading
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Passo 3: Template Criado</h2>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>1. JSON para criar o template:</h3>
        <JsonViewer 
          json={finalJson.createTemplate} 
          onCopy={() => copyToClipboard('createTemplate')} 
        />
      </div>
      
      <div className={styles.largeSection}>
        <h3 className={styles.sectionTitle}>2. JSON para enviar o template:</h3>
        <JsonViewer 
          json={finalJson.sendTemplate} 
          onCopy={() => copyToClipboard('sendTemplate')} 
        />
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
      
      <div className={styles.nextStepsSection}>
        <h3 className={styles.nextStepsTitle}>Próximos Passos:</h3>
        <ol className={styles.stepsList}>
          <li className={styles.stepItem}>O template criado precisa ser aprovado pela Meta antes de poder ser enviado</li>
          <li className={styles.stepItem}>O processo de aprovação geralmente leva algumas horas ou dias</li>
          <li className={styles.stepItem}>Após aprovado, você pode enviar o template para qualquer contato que interagiu com seu número</li>
        </ol>
      </div>
      
      <div className={styles.largeSection}>
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

export default StepThree;