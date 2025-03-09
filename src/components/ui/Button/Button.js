// components/common/Button.js
import React from 'react';
import styles from './Button.module.css';

/**
 * Enhanced reusable Button component
 * Standardized to match the application design system
 * 
 * @param {Object} props Component properties
 * @param {React.ReactNode} props.children Button content/label
 * @param {string} props.variant Button style variant (solid, outline, text)
 * @param {string} props.color Button color scheme (primary, content, success, danger)
 * @param {string} props.size Button size (small, medium, large)
 * @param {string} props.type Button HTML type attribute
 * @param {boolean} props.disabled Whether the button is disabled
 * @param {boolean} props.loading Whether to show loading spinner
 * @param {boolean} props.fullWidth Whether the button should take full width
 * @param {boolean} props.mediumWidth Whether the button should take medium width
 * @param {boolean} props.rounded Whether the button should have fully rounded corners
 * @param {React.ReactNode} props.iconLeft Icon to display at the left of text
 * @param {React.ReactNode} props.iconRight Icon to display at the right of text
 * @param {string} props.className Additional CSS classes
 * @param {Function} props.onClick Click handler function
 * @param {string} props.as Render the button as a different component (e.g., 'a' for link)
 * @param {string} props.href Href attribute for link-like buttons
 * @param {string} props.target Target attribute for link-like buttons
 * @param {Object} props.tooltipProps Tooltip properties for the button
 * @returns {JSX.Element} Button component
 */
const Button = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  mediumWidth = false,
  rounded = false,
  iconLeft,
  iconRight,
  className = '',
  onClick,
  as: Component = 'button',
  href,
  target,
  tooltipProps,
  ...restProps
}) => {
  // Construct CSS class names dynamically
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    styles[`size-${size}`],
    disabled ? styles.disabled : '',
    loading ? styles.loading : '',
    fullWidth ? styles.fullWidth : '',
    mediumWidth ? styles.mediumWidth : '',
    rounded ? styles.rounded : '',
    className
  ].filter(Boolean).join(' ');
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className={styles.loadingIcon}>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle className={styles.loadingCircle} cx="12" cy="12" r="10" 
          stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
    </div>
  );
  
  // Prepare props based on button type
  const componentProps = {
    ...restProps,
    className: buttonClasses,
    disabled: disabled || loading,
    onClick: !loading && !disabled ? onClick : undefined,
  };

  // Add href and target for link-like buttons
  if (Component === 'a') {
    componentProps.href = href;
    componentProps.target = target;
  }

  // Add type for button elements
  if (Component === 'button') {
    componentProps.type = type;
  }

  // Render button content
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children && <span className={styles.text}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </>
  );

  // Wrap with tooltip if tooltip props are provided
  const renderButton = () => {
    const BasicButton = (
      <Component {...componentProps}>
        {buttonContent}
      </Component>
    );

    // If tooltip props are provided, wrap the button with a tooltip component
    if (tooltipProps) {
      return (
        <Tooltip {...tooltipProps}>
          {BasicButton}
        </Tooltip>
      );
    }

    return BasicButton;
  };

  return renderButton();
};

// Tooltip component (you'll need to replace this with your actual Tooltip implementation)
const Tooltip = ({ children, text, ...props }) => {
  return (
    <div className={styles.tooltipWrapper} {...props}>
      {children}
      <span className={styles.tooltipText}>{text}</span>
    </div>
  );
};

export default Button;