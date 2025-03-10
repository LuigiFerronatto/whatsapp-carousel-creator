// components/ui/AlertMessage/AlertMessage.js
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './AlertMessage.module.css';

/**
 * Enhanced AlertMessage component for displaying notifications with customizable positioning
 * 
 * @param {Object} props Component properties
 * @param {string} props.id Unique ID for the alert
 * @param {string} props.type Type of alert ('success', 'error', 'info', 'warning')
 * @param {string} props.content Message content to display
 * @param {boolean} props.autoClose Whether the alert should auto-close
 * @param {number} props.autoCloseTime Time in ms before auto-closing
 * @param {Function} props.onClose Callback function when alert is closed
 * @param {string} props.position Positioning of alert ('top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left')
 * @param {boolean} props.closable Whether the alert can be manually closed
 * @param {boolean} props.floating Whether the alert should float over content
 * @param {string} props.className Additional class names
 * @returns {JSX.Element|null} AlertMessage component or null if not visible
 */
const AlertMessage = ({ 
  id,
  type = 'info',
  content,
  autoClose = true,
  autoCloseTime = 5000,
  onClose = () => {},
  position = 'top-right',
  closable = true,
  floating = true,
  className = '',
  ...restProps
}) => {
  // State to track visibility
  const [visible, setVisible] = useState(true);
  
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

  // If not visible, don't render
  if (!visible) {
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
      data-alert-id={id}
      {...restProps}
    >
      <div className={styles.alertContent}>
        {getIcon()}
        <div className={styles.message}>{content}</div>
      </div>
      {closable && (
        <button 
          className={styles.closeButton} 
          onClick={handleClose}
          aria-label="Close alert"
        >
          <FiX size={18} />
        </button>
      )}
      
      {autoClose && (
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ animationDuration: `${autoCloseTime}ms` }}></div>
        </div>
      )}
    </div>
  );
};

export default AlertMessage;