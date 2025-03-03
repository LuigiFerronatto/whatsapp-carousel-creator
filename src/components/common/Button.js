// components/common/Button.js
import React from 'react';
import styles from './Button.module.css';

/**
 * Standardized button component that follows the Blip design system
 * @param {Object} props - Component properties
 * @param {string} props.variant - Button variant: 'solid' (default), 'outline', 'text'
 * @param {string} props.color - Button color: 'primary' (default), 'content', 'positive', 'negative'
 * @param {string} props.size - Button size: 'medium' (default), 'small', 'large'
 * @param {boolean} props.loading - Indicates if the button is in loading state
 * @param {React.ReactNode} props.iconLeft - Icon to display on the left side
 * @param {React.ReactNode} props.iconRight - Icon to display on the right side
 * @param {boolean} props.disabled - Indicates if the button is disabled
 * @param {boolean} props.fullWidth - Makes the button take full width of its container
 * @param {string} props.className - Additional CSS class names
 * @param {Function} props.onClick - Click event handler
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} Button component
 */
const Button = ({
  variant = 'solid',
  color = 'primary',
  size = 'medium',
  loading = false,
  iconLeft,
  iconRight,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  children,
  ...props
}) => {
  // Combine class names
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    styles[`size-${size}`],
    loading && styles.loading,
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  // Render loading spinner
  const renderLoadingSpinner = () => (
    <svg className={styles.loadingIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle className={styles.loadingCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );

  // Render left icon
  const renderLeftIcon = () => {
    if (loading) {
      return renderLoadingSpinner();
    }
    
    if (iconLeft) {
      return <span className={styles.iconLeft}>{iconLeft}</span>;
    }
    
    return null;
  };

  // Render right icon
  const renderRightIcon = () => {
    if (iconRight) {
      return <span className={styles.iconRight}>{iconRight}</span>;
    }
    
    return null;
  };

  return (
    <button
      className={buttonClasses}
      onClick={!loading && !disabled ? onClick : undefined}
      disabled={loading || disabled}
      {...props}
    >
      {renderLeftIcon()}
      {children && <span className={styles.text}>{children}</span>}
      {renderRightIcon()}
    </button>
  );
};

export default Button;