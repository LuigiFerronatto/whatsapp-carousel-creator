// components/common/AlertMessage.js
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './AlertMessage.module.css';

/**
 * Enhanced AlertMessage component for displaying notifications
 * 
 * @param {Object} props Component properties
 * @param {string} props.success Success message text
 * @param {string} props.error Error message text
 * @param {string} props.info Information message text
 * @param {string} props.warning Warning message text
 * @param {boolean} props.autoClose Whether the alert should auto-close
 * @param {number} props.autoCloseTime Time in ms before auto-closing
 * @param {Function} props.onClose Callback function when alert is closed
 * @returns {JSX.Element|null} AlertMessage component or null if no message
 */
const AlertMessage = ({ 
  success, 
  error, 
  info, 
  warning,
  autoClose = true,
  autoCloseTime = 5000,
  onClose = () => {}
}) => {
  // Determine message type and content
  const [visible, setVisible] = useState(true);
  
  let type = 'info';
  let message = info;
  
  if (success) {
    type = 'success';
    message = success;
  } else if (error) {
    type = 'error';
    message = error;
  } else if (warning) {
    type = 'warning';
    message = warning;
  }

  // Auto-close the alert after specified time
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, autoCloseTime]);

  // Handle manual close
  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  // If no message or not visible, don't render
  if (!message || !visible) {
    return null;
  }

  // Get appropriate icon based on message type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.icon} size={20} />;
      case 'error':
        return <FiAlertCircle className={styles.icon} size={20} />;
      case 'warning':
        return <FiAlertCircle className={styles.icon} size={20} />;
      default:
        return <FiInfo className={styles.icon} size={20} />;
    }
  };

  return (
    <div className={`${styles.alertContainer} ${styles[type]}`} role="alert">
      <div className={styles.alertContent}>
        {getIcon()}
        <div className={styles.message}>{message}</div>
      </div>
      <button 
        className={styles.closeButton} 
        onClick={handleClose}
        aria-label="Close alert"
      >
        <FiX size={18} />
      </button>
      
      {autoClose && (
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ animationDuration: `${autoCloseTime}ms` }}></div>
        </div>
      )}
    </div>
  );
};

export default AlertMessage;