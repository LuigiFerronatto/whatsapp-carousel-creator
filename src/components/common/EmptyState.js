// components/common/EmptyState.js
import React from 'react';
import { FiSearch, FiAlertTriangle, FiCheckCircle, FiFileText } from 'react-icons/fi';
import Button from './Button';
import styles from './EmptyState.module.css';

/**
 * EmptyState component for displaying empty states following Blip design system
 * @param {Object} props - Component properties
 * @param {string} props.title - Title for the empty state
 * @param {string} props.description - Description of what to do to fill the empty state
 * @param {React.ReactNode} props.icon - Custom icon for the empty state
 * @param {string} props.imageUrl - URL for a custom image
 * @param {string} props.type - Type of empty state: 'first-access', 'post-action', 'no-results', 'error'
 * @param {Function} props.primaryAction - Function to execute the primary action
 * @param {string} props.primaryActionLabel - Text for the primary action button
 * @param {Function} props.secondaryAction - Function to execute the secondary action
 * @param {string} props.secondaryActionLabel - Text for the secondary action link
 * @param {boolean} props.fullPage - Whether the empty state should occupy the full page
 * @returns {JSX.Element} EmptyState component
 */
const EmptyState = ({
  title,
  description,
  icon,
  imageUrl,
  type = 'first-access',
  primaryAction,
  primaryActionLabel,
  secondaryAction,
  secondaryActionLabel,
  fullPage = false
}) => {
  // Function to render the default icon based on type
  const renderDefaultIcon = () => {
    switch (type) {
      case 'no-results':
        return <FiSearch className={styles.typeIcon} />;
      case 'error':
        return <FiAlertTriangle className={styles.typeIcon} />;
      case 'post-action':
        return <FiCheckCircle className={styles.typeIcon} />;
      default: // 'first-access'
        return <FiFileText className={styles.typeIcon} />;
    }
  };

  return (
    <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.content}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className={styles.image} />
        ) : (
          <div className={`${styles.iconContainer} ${styles[`type-${type}`]}`}>
            {icon || renderDefaultIcon()}
          </div>
        )}
        
        <h3 className={styles.title}>{title}</h3>
        
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        <div className={styles.actions}>
          {primaryAction && primaryActionLabel && (
            <Button 
              variant="solid"
              color="primary"
              onClick={primaryAction}
            >
              {primaryActionLabel}
            </Button>
          )}
          
          {secondaryAction && secondaryActionLabel && (
            <Button 
              variant="text"
              color="primary"
              onClick={secondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;