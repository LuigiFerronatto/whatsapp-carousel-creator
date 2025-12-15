// components/StatusMessage.js
import React from 'react';
import styles from './StatusMessage.module.css';

const StatusMessage = ({ error, success }) => {
  // Helper function to extract error message
  const getErrorMessage = (errorObj) => {
    // If it's already a string, return it
    if (typeof errorObj === 'string') return errorObj;
    
    // If it's an object with a message property, return that
    if (errorObj && errorObj.message) return errorObj.message;
    
    // If it's an object, convert to a readable string
    if (typeof errorObj === 'object') {
      return JSON.stringify(errorObj);
    }
    
    // Fallback to a generic error message
    return 'Ocorreu um erro desconhecido';
  };

  return (
    <>
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.messageTitle}>Erro:</div>
          <div>{getErrorMessage(error)}</div>
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