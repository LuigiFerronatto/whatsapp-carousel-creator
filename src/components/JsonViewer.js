// components/JsonViewer.js
import React from 'react';
import styles from './JsonViewer.module.css';

const JsonViewer = ({ json, onCopy }) => {
  if (!json) {
    return (
      <div className={styles.emptyContainer}>
        JSON não disponível
      </div>
    );
  }

  return (
    <div className={styles.jsonContainer}>
      <pre className={styles.jsonContent}>
        {JSON.stringify(json, null, 2)}
      </pre>
      <button 
        className={styles.copyButton}
        onClick={onCopy}
      >
        Copiar
      </button>
    </div>
  );
};

export default JsonViewer;