// components/ProgressHeader.js
import React from 'react';
import styles from './ProgressHeader.module.css';

const ProgressHeader = ({ step }) => {
  return (
    <div className={styles.progressContainer}>
      <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>
        1. Upload de Arquivos
      </div>
      <div className={styles.separator}></div>
      <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>
        2. Criação do Template
      </div>
      <div className={styles.separator}></div>
      <div className={`${styles.step} ${step >= 3 ? styles.activeStep : ''}`}>
        3. Finalização
      </div>
    </div>
  );
};

export default ProgressHeader;