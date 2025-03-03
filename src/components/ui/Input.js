// components/ui/Input.js
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

/**
 * Componente de input padronizado
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Componente de input
 */
const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  maxLength,
  className = '',
  inputClassName = '',
  ...restProps
}, ref) => {
  // Construir classes CSS
  const containerClasses = [
    styles.container,
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
    icon ? styles.hasIcon : '',
    icon && iconPosition === 'left' ? styles.iconLeft : '',
    icon && iconPosition === 'right' ? styles.iconRight : '',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    error ? styles.inputError : '',
    inputClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {icon && iconPosition === 'left' && (
          <span className={styles.icon}>{icon}</span>
        )}
        
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={inputClasses}
          required={required}
          {...restProps}
        />
        
        {icon && iconPosition === 'right' && (
          <span className={styles.icon}>{icon}</span>
        )}
        
        {maxLength && value && (
          <span className={styles.charCount}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      {(hint || error) && (
        <div className={error ? styles.errorMessage : styles.hint}>
          {error || hint}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  hint: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  maxLength: PropTypes.number,
  className: PropTypes.string,
  inputClassName: PropTypes.string
};

export default Input;