// components/common/AlertMessage.js
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './AlertMessage.module.css';

/**
 * Enhanced AlertMessage component for displaying notifications with customizable positioning
 * 
 * @param {Object} props Component properties
 * @param {string} props.success Success message text
 * @param {string} props.error Error message text
 * @param {string} props.info Information message text
 * @param {string} props.warning Warning message text
 * @param {boolean} props.autoClose Whether the alert should auto-close
 * @param {number} props.autoCloseTime Time in ms before auto-closing
 * @param {Function} props.onClose Callback function when alert is closed
 * @param {string} props.position Positioning of alert ('top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left')
 * @param {boolean} props.floating Whether the alert should float over content
 * @param {string} props.className Additional class names
 * @returns {JSX.Element|null} AlertMessage component or null if no message
 */
const AlertMessage = ({ 
  success, 
  error, 
  info, 
  warning,
  autoClose = true,
  autoCloseTime = 5000,
  onClose = () => {},
  position = 'top-right',
  floating = true,
  className = '',
  ...restProps
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

  // Combine classes for positioning and floating
  const containerClasses = [
    styles.alertContainer,
    styles[type],
    floating ? styles.floating : '',
    styles[`position-${position}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses} 
      role="alert"
      {...restProps}
    >
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