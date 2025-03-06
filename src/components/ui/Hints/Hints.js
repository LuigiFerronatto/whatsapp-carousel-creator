// ui/Hints/Hints.js

import React from 'react';
import PropTypes from 'prop-types';
import { FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import styles from './Hints.module.css';

const Hints = ({
  variant = 'simple',
  message,
  title,
  list,
  className
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'simple': return <FiInfo size={16} />;
      case 'detailed': return <FiInfo size={20} />;
      case 'whatsapp': return <FiInfo size={16} className={styles.whatsappIcon} />;
      case 'warning': return <FiAlertCircle size={16} className={styles.warningIcon} />;
      case 'success': return <FiCheckCircle size={16} className={styles.successIcon} />;
      default: return <FiInfo size={16} />;
    }
  };

  return (
    <div className={`
      ${styles.hintContainer} 
      ${styles[variant]} 
      ${className || ''}
    `}>
      <div className={styles.hintIconWrapper}>
        {getIcon()}
      </div>
      
      <div className={styles.hintContent}>
        {title && <div className={styles.hintTitle}>{title}</div>}
        
        {typeof message === 'string' ? (
          <p className={styles.hintMessage}>{message}</p>
        ) : (
          message
        )}
        
        {list && list.length > 0 && (
          <ul className={styles.hintList}>
            {list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Hints.propTypes = {
  variant: PropTypes.oneOf(['simple', 'detailed', 'whatsapp', 'warning', 'success']),
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  title: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

Hints.defaultProps = {
  variant: 'simple',
  title: null,
  list: null,
  className: ''
};

export default Hints;