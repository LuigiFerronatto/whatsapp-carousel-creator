// components/common/AlertMessage.js
import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import styles from './AlertMessage.module.css';

/**
 * Standardized alert message component following the Blip design system
 * @param {Object} props - Component properties
 * @param {string} props.error - Error message (if any)
 * @param {string} props.success - Success message (if any)
 * @param {string} props.info - Informational message (if any)
 * @param {string} props.warning - Warning message (if any)
 * @param {Function} props.onClose - Callback function when the alert is closed
 * @param {boolean} props.autoClose - Whether the alert should close automatically after a delay
 * @param {number} props.autoCloseDelay - Delay in milliseconds before auto-closing (default: 5000)
 * @returns {JSX.Element|null} Alert message component or null if no message
 */
const AlertMessage = ({ 
  error, 
  success, 
  info, 
  warning, 
  onClose,
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  const [visible, setVisible] = useState(true);
  
  // Auto-close functionality
  useEffect(() => {
    if (autoClose && (error || success || info || warning)) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          onClose();
        }
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, error, success, info, warning, onClose]);

  // If no message or not visible, don't render anything
  if (!visible || (!error && !success && !info && !warning)) {
    return null;
  }

  // Determine the type of alert and its message
  let alertType = 'info';
  let message = info;

  if (error) {
    alertType = 'error';
    message = error;
  } else if (warning) {
    alertType = 'warning';
    message = warning;
  } else if (success) {
    alertType = 'success';
    message = success;
  }

  // Get the appropriate icon based on the alert type
  const getIcon = () => {
    switch (alertType) {
      case 'error':
        return <FiAlertTriangle className={styles.icon} />;
      case 'warning':
        return <FiAlertTriangle className={styles.icon} />;
      case 'success':
        return <FiCheckCircle className={styles.icon} />;
      case 'info':
      default:
        return <FiInfo className={styles.icon} />;
    }
  };
  
  // Handle close click
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`${styles.container} ${styles[alertType]} ${visible ? styles.visible : styles.hidden}`} 
      role="alert"
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          {getIcon()}
        </div>
        <div className={styles.messageContainer}>
          <div className={styles.title}>
            {alertType === 'error' && 'Error'}
            {alertType === 'warning' && 'Warning'}
            {alertType === 'success' && 'Success'}
            {alertType === 'info' && 'Information'}
          </div>
          <div className={styles.message}>{message}</div>
        </div>
      </div>
      {onClose && (
        <button 
          className={styles.closeButton} 
          onClick={handleClose}
          aria-label="Close"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;