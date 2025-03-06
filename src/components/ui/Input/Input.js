// components/ui/Input.js
import React, { forwardRef, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';
import CharacterCounter from '../CharacterCounter/CharacterCounter';
import TextFormatter from '../TextFormatter/TextFormatter';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Enhanced Input component with validation, masks and formatting
 * @param {Object} props - Component properties
 * @returns {JSX.Element} Input component
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
  readOnly = false,
  icon,
  iconPosition = 'right',
  maxLength,
  minLength,
  regexPattern,
  regexErrorMessage,
  variant = 'default', // 'default', 'phoneNumber', 'cpf', 'cnpj', 'cep', 'rg', 'name', 'email', etc.
  mask,
  showCharCounter = false,
  showCounterFormatting = true, // Controla se o contador mostra formatação visual
  allowFormatting = false,
  className = '',
  inputClassName = '',
  clearable = false,
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = true,
  formatOnBlur = false,
  validateOnChange = false,
  validateOnBlur = true,
  toolbar, // Para adicionar barra de formatação de texto
  rightElement, // Elemento adicional à direita do input
  leftElement, // Elemento adicional à esquerda do input
  characterCounterVariant = 'default', // 'default', 'compact', 'minimal'
  inlineHint, // Dica inline ao lado do input
  textFormatting = false, // Novo prop para habilitar a barra de formatação
  textFormattingCompact = false, // Tamanho compacto da barra de formatação
  textFormattingDarkMode = false, // Tema escuro para a barra de formatação
  textFormattingShowHint = true, // Mostrar dicas na barra de formatação
  ...restProps
}, ref) => {
  // Create internal ref if none provided
  const inputRef = useRef(null);
  const combinedRef = ref || inputRef;
  
  // Local state
  const [localValue, setLocalValue] = useState(value || '');
  const [localError, setLocalError] = useState(error || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changedFields, setChangedFields] = useState([]); // Para destacar campos alterados

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Update local error when prop changes
  useEffect(() => {
    setLocalError(error || '');
  }, [error]);

  // Limpa realce de campos alterados após um tempo
  useEffect(() => {
    if (changedFields.length > 0) {
      const timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [changedFields]);

  // Predefined regex patterns
  const patterns = {
    phoneNumber: /^\(\d{2}\) \d{5}-\d{4}$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    cep: /^\d{5}-\d{3}$/,
    rg: /^(\d{1,2})\.(\d{3})\.(\d{3})-(\d{1}|X|x)$/,
    name: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    creditCard: /^(?:\d{4}[ -]?){3}\d{4}$/,
    number: /^[0-9]+$/,
    onlyLetters: /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/,
    alphanumeric: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+$/,
    templateName: /^[a-z0-9_]{3,}$/
  };

  // Mask functions
  const applyMask = (value, maskType) => {
    if (!value) return '';
    
    const digits = value.replace(/\D/g, '');
    
    switch (maskType) {
      case 'phoneNumber':
        if (digits.length <= 11) {
          return digits.replace(/^(\d{2})(\d{0,5})(\d{0,4})/, (_, p1, p2, p3) => {
            let result = '';
            if (p1) result += `(${p1}`;
            if (p2) result += `) ${p2}`;
            if (p3) result += `-${p3}`;
            return result;
          }).trim();
        }
        return value;
      
      case 'cpf':
        return digits
          .slice(0, 11)
          .replace(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
            let result = '';
            if (p1) result += p1;
            if (p2) result += `.${p2}`;
            if (p3) result += `.${p3}`;
            if (p4) result += `-${p4}`;
            return result;
          });
      
      case 'cnpj':
        return digits
          .slice(0, 14)
          .replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
            let result = '';
            if (p1) result += p1;
            if (p2) result += `.${p2}`;
            if (p3) result += `.${p3}`;
            if (p4) result += `/${p4}`;
            if (p5) result += `-${p5}`;
            return result;
          });
      
      case 'cep':
        return digits
          .slice(0, 8)
          .replace(/^(\d{5})(\d{0,3})/, (_, p1, p2) => {
            let result = '';
            if (p1) result += p1;
            if (p2) result += `-${p2}`;
            return result;
          });
      
      case 'rg':
        return digits
          .slice(0, 9)
          .replace(/^(\d{1,2})(\d{0,3})(\d{0,3})(\d{0,1})/, (_, p1, p2, p3, p4) => {
            let result = '';
            if (p1) result += p1;
            if (p2) result += `.${p2}`;
            if (p3) result += `.${p3}`;
            if (p4) result += `-${p4}`;
            return result;
          });
      
      case 'creditCard':
        return digits
          .slice(0, 16)
          .replace(/(\d{4})/g, '$1 ')
          .trim();
          
      case 'date':
        return digits
          .slice(0, 8)
          .replace(/^(\d{2})(\d{0,2})(\d{0,4})/, (_, p1, p2, p3) => {
            let result = '';
            if (p1) result += p1;
            if (p2) result += `/${p2}`;
            if (p3) result += `/${p3}`;
            return result;
          });
      
      case 'custom':
        if (mask && typeof mask === 'string') {
          let result = '';
          let digitIndex = 0;
          
          for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
            const maskChar = mask[i];
            if (maskChar === '#') {
              result += digits[digitIndex++] || '';
            } else {
              result += maskChar;
              // If the next digit in the input matches the next mask character, skip it
              if (digits[digitIndex] === maskChar) digitIndex++;
            }
          }
          
          return result;
        }
        return value;
      
      default:
        return value;
    }
  };

  // Formatting functions
  const formatValue = (value, variant) => {
    if (!value || !allowFormatting) return value;
    
    switch (variant) {
      case 'name':
        // Capitalize each word
        return value.replace(/\b\w/g, char => char.toUpperCase());
        
      case 'email':
        // Convert to lowercase
        return value.toLowerCase();
      
      case 'url':
        // Ensure URL has protocol
        if (value && !value.match(/^https?:\/\//i)) {
          return `https://${value}`;
        }
        return value;
      
      case 'uppercase':
        return value.toUpperCase();
      
      case 'lowercase':
        return value.toLowerCase();
      
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1);
        
      case 'sentence':
        // Capitalize first letter of each sentence
        return value.replace(/(^\s*|[.!?]\s+)([a-z])/g, match => match.toUpperCase());

      case 'templateName':
      // Converte para snake_case: letras minúsculas, números e underscores
      return value
        .toLowerCase()
        .replace(/\s+/g, '_')       // Substitui espaços por underscores
        .replace(/[^a-z0-9_]/g, '') // Remove caracteres não permitidos
        .replace(/_+/g, '_');       // Evita underscores duplicados
      
      default:
        return value;
    }
  };

  // Validation functions
  const validateValue = (valueToValidate) => {
    // Skip validation if disabled or read-only
    if (disabled || readOnly) return '';
    
    // Required validation
    if (required && !valueToValidate?.trim()) {
      return 'This field is required';
    }
    
    // Skip more validations if the field is empty and not required
    if (!valueToValidate) return '';
    
    // Min length validation
    if (minLength && valueToValidate.length < minLength) {
      return `Minimum length is ${minLength} characters`;
    }
    
    // Max length validation (should not happen due to maxLength attribute)
    if (maxLength && valueToValidate.length > maxLength) {
      return `Maximum length is ${maxLength} characters`;
    }
    
    // Regex validation (custom or predefined)
    const patternToUse = regexPattern || (patterns[variant] || null);
    if (patternToUse && valueToValidate && !patternToUse.test(valueToValidate)) {
      if (variant === 'templateName') {
        return "Use a descriptive name without spaces, minimum 3 characters. Example: 'summer_promo' or 'product_launch'";
      }
      return regexErrorMessage || `Invalid ${variant || 'format'}`;
    }
    
    return '';
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle clearing the input
  const handleClear = () => {
    setLocalValue('');
    
    // Call onChange with empty value
    if (onChange) {
      const syntheticEvent = {
        target: { name, value: '' },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      onChange(syntheticEvent);
    }
    
    // Focus the input after clearing
    if (combinedRef.current) {
      combinedRef.current.focus();
    }
    
    // Mark as changed
    if (!changedFields.includes('value')) {
      setChangedFields(prev => [...prev, 'value']);
    }
  };

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Validação em tempo real para a variante templateName
  if (variant === 'templateName') {
    // Permitir apenas letras minúsculas, números e underscores
    newValue = newValue.replace(/[^a-z0-9_]/g, '').toLowerCase();
  }
    
    // Apply mask if needed
    if (variant && variant !== 'default') {
      newValue = applyMask(newValue, variant);
    } else if (mask) {
      newValue = applyMask(newValue, 'custom');
    }
    
    // Apply formatting if allowed (and not deferring to blur)
    if (allowFormatting && !formatOnBlur) {
      newValue = formatValue(newValue, variant);
    }
    
    // Update local state
    setLocalValue(newValue);
    
    // Call original onChange with new value
    if (onChange) {
      const syntheticEvent = { ...e, target: { ...e.target, value: newValue } };
      onChange(syntheticEvent);
    }
    
    // Validate on change if enabled
    if (validateOnChange && isTouched) {
      const validationError = validateValue(newValue);
      setLocalError(validationError);
    }
    
    // Mark as changed
    if (!changedFields.includes('value')) {
      setChangedFields(prev => [...prev, 'value']);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    setIsTouched(true);
    
    if (restProps.onFocus) {
      restProps.onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    
    let finalValue = e.target.value;
    
    // Apply formatting on blur if configured
    if (allowFormatting && formatOnBlur) {
      finalValue = formatValue(finalValue, variant);
      setLocalValue(finalValue);
      
      // Call onChange with formatted value
      if (onChange) {
        const syntheticEvent = { ...e, target: { ...e.target, value: finalValue } };
        onChange(syntheticEvent);
      }
    }
    
    // Validate on blur if configured
    if (validateOnBlur) {
      const validationError = validateValue(finalValue);
      setLocalError(validationError);
    }
    
    // Call original onBlur
    if (onBlur) {
      if (allowFormatting && formatOnBlur) {
        // Pass the formatted value
        const syntheticEvent = { ...e, target: { ...e.target, value: finalValue } };
        onBlur(syntheticEvent);
      } else {
        onBlur(e);
      }
    }
  };

  // Build class names
  const containerClasses = [
    styles.container,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    localError ? styles.hasError : '',
    disabled ? styles.disabled : '',
    readOnly ? styles.readOnly : '',
    icon ? styles.hasIcon : '',
    leftElement ? styles.hasLeftElement : '',
    rightElement ? styles.hasRightElement : '',
    icon && iconPosition === 'left' ? styles.iconLeft : '',
    icon && iconPosition === 'right' ? styles.iconRight : '',
    isFocused ? styles.focused : '',
    !fullWidth ? styles.inline : '',
    changedFields.includes('value') ? styles.changed : '',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    localError ? styles.inputError : '',
    inputClassName
  ].filter(Boolean).join(' ');

  const getInputType = () => {
    // Handle password toggle
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    
    // Override type for specific variants
    if (['phoneNumber', 'cpf', 'cnpj', 'cep', 'rg'].includes(variant)) {
      return 'tel';
    }
    
    if (variant === 'email') {
      return 'email';
    }
    
    if (variant === 'number' || variant === 'onlyNumbers') {
      return 'tel'; // Use tel instead of number for better mask control
    }
    
    if (variant === 'url') {
      return 'url';
    }
    
    return type;
  };

  // Render password toggle button
  const renderPasswordToggle = () => {
    if (type !== 'password') return null;
    
    return (
      <button
        type="button"
        className={styles.visibilityToggle}
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "Hide" : "Show"}
        tabIndex="-1"
      >
        {showPassword ? (
          <FiEyeOff size={16} />
        ) : (
          <FiEye size={16} />
        )}
        {<span>{showPassword ? "Hide" : "Show"}</span>}
      </button>
    );
  };
  
  
  // Render clear button
  const renderClearButton = () => {
    if (!clearable || !localValue || disabled || readOnly) return null;
    
    return (
      <button
        type="button"
        className={styles.clearButton}
        onClick={handleClear}
        aria-label="Clear input"
        tabIndex="-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    );
  };

  // Renderizar a barra de formatação se textFormatting for true
  const renderFormatting = () => {
    if (textFormatting) {
      return (
        <TextFormatter 
          onChange={handleChange}
          value={localValue}
          inputRef={combinedRef}
          compact={textFormattingCompact}
          darkMode={textFormattingDarkMode}
          showHint={textFormattingShowHint}
        />
      );
    }
    return toolbar;
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}
      
      {(textFormatting || toolbar) && (
        <div className={styles.toolbar}>
          {renderFormatting()}
        </div>
      )}
      
      <div className={styles.inputWrapper}>
        {leftElement && (
          <div className={styles.leftElement}>{leftElement}</div>
        )}
      
        {icon && iconPosition === 'left' && (
          <span className={styles.icon}>{icon}</span>
        )}
        
        {inlineHint && (
          <span className={styles.inlineHint}>{inlineHint}</span>
        )}
        
        {type === 'textarea' ? (
          <textarea
            ref={combinedRef}
            id={id}
            name={name}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            minLength={minLength}
            className={`${styles.textarea} ${inputClasses}`}
            required={required}
            rows={restProps.rows || 3}
            {...restProps}
          />
        ) : (
          <input
            ref={combinedRef}
            id={id}
            name={name}
            type={getInputType()}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            minLength={minLength}
            className={inputClasses}
            required={required}
            {...restProps}
          />
        )}
        
        {type === 'password' && renderPasswordToggle()}
        {clearable && renderClearButton()}
        
        {icon && iconPosition === 'right' && (
          <span className={styles.icon}>{icon}</span>
        )}
        
        {rightElement && (
          <div className={styles.rightElement}>{rightElement}</div>
        )}
      </div>
      
      <div className={styles.bottomWrapper}>
        {(hint || localError) && (
          <div className={localError ? styles.errorMessage : styles.hint}>
            {localError || hint}
          </div>
        )}
        
        {showCharCounter && maxLength && (
          <div className={styles.counterWrapper}>
            <CharacterCounter 
              current={localValue ? localValue.length : 0} 
              max={maxLength} 
              className={styles.charCounter}
              variant={characterCounterVariant}
              showFormatting={showCounterFormatting}
            />
          </div>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'number', 'url', 'textarea', 'date', 'time', 'search']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  hint: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  regexPattern: PropTypes.instanceOf(RegExp),
  regexErrorMessage: PropTypes.string,
  variant: PropTypes.oneOf([
    'default', 'phoneNumber', 'cpf', 'cnpj', 'cep', 'rg', 'name', 
    'email', 'url', 'onlyNumbers', 'onlyLetters', 'alphanumeric', 
    'creditCard', 'date', 'uppercase', 'lowercase', 'capitalize', 'sentence', 'templateName'
  ]),
  mask: PropTypes.string,
  showCharCounter: PropTypes.bool,
  showCounterFormatting: PropTypes.bool,
  allowFormatting: PropTypes.bool,
  formatOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  clearable: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  toolbar: PropTypes.node,
  rightElement: PropTypes.node,
  leftElement: PropTypes.node,
  characterCounterVariant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  inlineHint: PropTypes.node,
  
  // Novos props para TextFormatter
  textFormatting: PropTypes.bool,
  textFormattingCompact: PropTypes.bool,
  textFormattingDarkMode: PropTypes.bool,
  textFormattingShowHint: PropTypes.bool
};

export default Input;