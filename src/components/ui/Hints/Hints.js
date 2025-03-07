// Hints.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FiInfo, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiMessageCircle, 
  FiX,
  FiChevronRight,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import styles from './Hints.module.css';

/**
 * Enhanced Hints component leveraging cognitive biases:
 * - Salience bias: Visual hierarchy with icons and colors to highlight importance
 * - Von Restorff effect: Distinctiveness through visual contrasts
 * - Serial position effect: Important information first
 * - Loss aversion: Warning hints emphasize potential losses
 * - Social proof: Optional count of others who found the hint useful
 * - Anchoring: Progress indicators to anchor expectations
 * - Chunking: Breaking information into digestible pieces
 * - Cognitive ease: Simple language and clear formatting
 */
const Hints = ({
  variant = 'info',
  message,
  title,
  list,
  className,
  isAnimated = false,
  isDismissable = false,
  isCheckable = false,
  isImportant = false,
  isCompact = false,
  progressValue = null,
  socialCount = null,
  actionText = null,
  actionCallback = null,
  onDismiss = null,
  iconOverride = null
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [checkedItems, setCheckedItems] = useState(
    list ? Array(list.length).fill(false) : []
  );

  // Apply animated effect on mount if needed
  useEffect(() => {
    if (isAnimated) {
      const timeout = setTimeout(() => {
        const element = document.getElementById(`hint-${hintId}`);
        if (element) {
          element.classList.remove(styles.animated);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isAnimated]);

  // Generate unique ID for this hint instance
  const hintId = Math.random().toString(36).substr(2, 9);

  const getIcon = () => {
    if (iconOverride) return iconOverride;
    
    switch (variant) {
      case 'info': return <FiInfo size={isCompact ? 14 : 18} />;
      case 'warning': return <FiAlertCircle size={isCompact ? 14 : 18} />;
      case 'success': return <FiCheckCircle size={isCompact ? 14 : 18} />;
      case 'whatsapp': return <FiMessageCircle size={isCompact ? 14 : 18} />;
      case 'simple': return <FiInfo size={isCompact ? 12 : 16} />;
      default: return <FiInfo size={isCompact ? 14 : 18} />;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const toggleCheckItem = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  // Don't render if dismissed
  if (!isVisible) return null;

  return (
    <div 
      id={`hint-${hintId}`}
      className={`
        ${styles.hintContainer} 
        ${styles[variant]} 
        ${isAnimated ? styles.animated : ''}
        ${isDismissable ? styles.dismissable : ''}
        ${isImportant ? styles.important : ''}
        ${isCompact ? styles.compact : ''}
        ${className || ''}
      `}
      role="alert"
      aria-live={isImportant ? "assertive" : "polite"}
    >
      <div className={styles.hintIconWrapper}>
        {getIcon()}
      </div>
      
      <div className={styles.hintContent}>
        {title && (
          <div className={styles.hintTitle}>
            {title}
          </div>
        )}
        
        {typeof message === 'string' ? (
          <p className={styles.hintMessage}>{message}</p>
        ) : (
          message
        )}
        
        {list && list.length > 0 && (
          <ul className={isCheckable ? styles.checkList : styles.hintList}>
            {list.map((item, index) => (
              isCheckable ? (
                <li key={index} className={styles.checkItem}>
                  <div 
                    className={styles.checkbox}
                    onClick={() => toggleCheckItem(index)}
                    role="checkbox"
                    aria-checked={checkedItems[index]}
                    tabIndex={0}
                  >
                    {checkedItems[index] ? (
                      <FiCheckSquare size={16} />
                    ) : (
                      <FiSquare size={16} />
                    )}
                  </div>
                  <span style={checkedItems[index] ? {textDecoration: 'line-through', opacity: 0.7} : {}}>
                    {item}
                  </span>
                </li>
              ) : (
                <li key={index}>{item}</li>
              )
            ))}
          </ul>
        )}
        
        {progressValue !== null && (
          <div className={styles.progressBar} style={{ width: `${progressValue}%` }} />
        )}
        
        {socialCount !== null && (
          <div className={styles.socialProofInfo}>
            <span className={styles.socialCount}>{socialCount}</span> users found this helpful
          </div>
        )}
        
        {actionText && actionCallback && (
          <div 
            className={styles.hintAction}
            onClick={actionCallback}
            role="button"
            tabIndex={0}
          >
            {actionText}
            <FiChevronRight size={14} />
          </div>
        )}
      </div>
      
      {isDismissable && (
        <button 
          className={styles.dismissButton} 
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

Hints.propTypes = {
  variant: PropTypes.oneOf([
    'simple', 'info', 'warning', 'success', 'whatsapp', 
    'detailed', 'buttonHint', 'textHint'
  ]),
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  title: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  isAnimated: PropTypes.bool,
  isDismissable: PropTypes.bool,
  isCheckable: PropTypes.bool,
  isImportant: PropTypes.bool,
  isCompact: PropTypes.bool,
  progressValue: PropTypes.number,
  socialCount: PropTypes.number,
  actionText: PropTypes.string,
  actionCallback: PropTypes.func,
  onDismiss: PropTypes.func,
  iconOverride: PropTypes.node
};

/**
 * HintsGroup component for grouping related hints
 */
export const HintsGroup = ({ children, title, className }) => {
  return (
    <div className={`${styles.hintsGroup} ${className || ''}`}>
      {title && <h4>{title}</h4>}
      {children}
    </div>
  );
};

HintsGroup.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
};

export default Hints;