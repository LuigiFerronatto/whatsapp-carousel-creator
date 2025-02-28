// components/StatusMessage.js
import React from 'react';
import styles from './StatusMessage.module.css';

const StatusMessage = ({ error, success }) => {
  return (
    <>
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.messageTitle}>Erro:</div>
          <div>{error}</div>
        </div>
      )}
      
      {success && (
        <div className={styles.successContainer}>
          <div className={styles.messageTitle}>Status:</div>
          <div>{success}</div>
        </div>
      )}
    </>
  );
};

export default StatusMessage;