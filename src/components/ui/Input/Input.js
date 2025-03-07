// Input.js
import React, { forwardRef, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';
import CharacterCounter from '../CharacterCounter/CharacterCounter';
import TextFormatter from '../TextFormatter/TextFormatter';
import Hints from '../Hints/Hints';
import { FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiX, FiInfo, FiAlertCircle } from 'react-icons/fi';

/**
 * Enhanced Input component with validation, masks, formatting, dropdown support, and improved hints
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
  // Hints specific props
  hintMessage,
  hintVariant = 'simple',
  hintTitle,
  hintList,
  hintIsDismissable = false,
  hintIsAnimated = false,
  hintIsImportant = false,
  hintIsCompact = false,
  hintSocialCount = null,
  hintActionText = null,
  hintActionCallback = null,
  hintOnDismiss = null,
  hintClassName = '',
  // Dropdown specific props
  isDropdown = false,
  options = [],
  optionLabelKey = 'label',
  optionValueKey = 'value',
  multiple = false,
  searchable = false,
  creatable = false,
  noOptionsMessage = 'No options available',
  onOptionCreate,
  customOptionComponent,
  dropdownWidth,
  dropdownMaxHeight = '250px',
  closeOnSelect = true,
  // Optional badge
  showOptionalBadge = false,
  optionalText = 'Optional',
  optionalBadgeClassName = '',
  // Existing props
  required = false,
  disabled = false,
  readOnly = false,
  icon,
  iconPosition = 'right',
  maxLength,
  minLength,
  regexPattern,
  regexErrorMessage,
  variant = 'default',
  mask,
  showCharCounter = false,
  showCounterFormatting = true,
  allowFormatting = false,
  className = '',
  inputClassName = '',
  clearable = false,
  size = 'medium',
  fullWidth = true,
  formatOnBlur = false,
  validateOnChange = false,
  validateOnBlur = true,
  toolbar,
  rightElement,
  leftElement,
  characterCounterVariant = 'default',
  textFormatting = false,
  textFormattingCompact = false,
  textFormattingDarkMode = false,
  textFormattingShowHint = true,
  ...restProps
}, ref) => {
  // Create internal ref if none provided
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const combinedRef = ref || inputRef;
  
  // Local state
  const [localValue, setLocalValue] = useState(value || '');
  const [localError, setLocalError] = useState(error || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changedFields, setChangedFields] = useState([]);
  
  // Dropdown specific state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  // Update local value when prop changes
  useEffect(() => {
    if (!isDropdown && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value, isDropdown]);
  
  // Initialize selected options for dropdown
  useEffect(() => {
    if (isDropdown && options && options.length > 0) {
      if (multiple) {
        const initialSelected = Array.isArray(value) 
          ? options.filter(option => 
              value.includes(option[optionValueKey] || option)
            )
          : [];
        
        setSelectedOptions(initialSelected);
        
        const displayText = initialSelected.length > 0
          ? initialSelected.map(opt => opt[optionLabelKey] || opt).join(', ')
          : '';
        
        if (displayText !== localValue) {
          setLocalValue(displayText);
        }
      } else {
        const selectedOption = options.find(option => 
          (option[optionValueKey] || option) === value
        );
        
        setSelectedOptions(selectedOption ? [selectedOption] : []);
        
        const displayValue = selectedOption ? (selectedOption[optionLabelKey] || selectedOption) : '';
        if (displayValue !== localValue) {
          setLocalValue(displayValue);
        }
      }
    }
  }, [isDropdown, options, value, optionValueKey, optionLabelKey, multiple]); // Remove selectedOptions e localValue
  
  // Update filtered options based on search
  useEffect(() => {
    // Comparar os arrays antes de atualizar
    const newFilteredOptions = isDropdown && searchable
      ? options.filter(option => {
          const optionLabel = option[optionLabelKey] || option;
          return String(optionLabel).toLowerCase().includes(searchValue.toLowerCase());
        })
      : options;
  
    // Verificar se realmente precisa atualizar
    const needsUpdate = JSON.stringify(filteredOptions) !== JSON.stringify(newFilteredOptions);
    
    if (needsUpdate) {
      setFilteredOptions(newFilteredOptions);
    }
  }, [isDropdown, options, searchValue, searchable, optionLabelKey]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Error state synchronization
  useEffect(() => {
    setLocalError(error || '');
  }, [error]);

  // Reset changed fields indication after some time
  useEffect(() => {
    if (changedFields.length > 0) {
      const timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [changedFields]);

  // Pre-defined regex patterns
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

  // Input mask function
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

        case 'internationalPhone':
          // Format: 55(country)55(state)9(verification digit)XXXXXXX(number)
          return digits.replace(/^(\d{0,2})(\d{0,2})(\d{0,1})(\d{0,7})/, (_, country, state, verificationDigit, number) => {
            let result = '';
            if (country) result += country;
            if (state) result += state;
            if (verificationDigit) result += verificationDigit;
            if (number) result += number;
            return result;
          }).trim();
      
      case 'cpf':
        return digits.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
          let result = '';
          if (p1) result += p1;
          if (p2) result += `.${p2}`;
          if (p3) result += `.${p3}`;
          if (p4) result += `-${p4}`;
          return result;
        }).trim();
      
      case 'cnpj':
        return digits.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
          let result = '';
          if (p1) result += p1;
          if (p2) result += `.${p2}`;
          if (p3) result += `.${p3}`;
          if (p4) result += `/${p4}`;
          if (p5) result += `-${p5}`;
          return result;
        }).trim();
      
      case 'cep':
        return digits.replace(/^(\d{0,5})(\d{0,3})/, (_, p1, p2) => {
          let result = '';
          if (p1) result += p1;
          if (p2) result += `-${p2}`;
          return result;
        }).trim();
      
      default:
        return value;
    }
  };

  // Value formatting function
  const formatValue = (value, variant) => {
    if (!value || !allowFormatting) return value;
    
    switch (variant) {
      case 'name':
        // Capitalize each word
        return value.replace(/\b\w/g, char => char.toUpperCase());
      
      case 'uppercase':
        return value.toUpperCase();
      
      case 'lowercase':
        return value.toLowerCase();
      
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1);
      
      case 'sentence':
        // Capitalize first letter of each sentence
        return value.replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase());
      
      default:
        return value;
    }
  };

  // Input validation function
  // Modificação para a função validateValue no Input.js
const validateValue = (valueToValidate) => {
  // Skip validation if disabled or read-only
  if (disabled || readOnly) return '';
  
  // For dropdown, check if a value is selected when required
  if (isDropdown && required && selectedOptions.length === 0) {
    return 'Este campo é obrigatório';
  }
  
  // Required validation for text inputs
  if (required && !valueToValidate?.trim() && !isDropdown) {
    return 'Este campo é obrigatório';
  }
  
  // Skip more validations if the field is empty and not required
  if (!valueToValidate && !isDropdown) return '';
  
  // Existing validations for text inputs
  if (!isDropdown) {
    // Min length validation
    if (minLength && valueToValidate.length < minLength) {
      return `O comprimento mínimo é de ${minLength} caracteres`;
    }
    
    // Max length validation (should not happen due to maxLength attribute)
    if (maxLength && valueToValidate.length > maxLength) {
      return `O comprimento máximo é de ${maxLength} caracteres`;
    }
    
    // MODIFICAÇÃO AQUI: Pular validação de regex para phoneNumber
    if (variant === 'phoneNumber') {
      // Verificar apenas se contém pelo menos alguns dígitos (básico)
      if (!/\d/.test(valueToValidate)) {
        return 'O número de telefone deve conter pelo menos um dígito';
      }
      return ''; // Pular validação regex
    }
    
    // Regex validation (custom or predefined)
    const patternToUse = regexPattern || (patterns[variant] || null);
    if (patternToUse && valueToValidate && !patternToUse.test(valueToValidate)) {
      if (variant === 'templateName') {
        return "Use um nome descritivo sem espaços, mínimo de 3 caracteres. Exemplo: 'promo_verao' ou 'lancamento_produto'";
      }
      return regexErrorMessage || `Formato inválido para ${variant || 'campo'}`;
    }
  }
  
  return '';
};

  // Dropdown specific handlers
  const handleDropdownToggle = () => {
    if (!disabled && !readOnly) {
      setIsDropdownOpen(!isDropdownOpen);
      if (!isDropdownOpen && combinedRef.current) {
        combinedRef.current.focus();
      }
    }
  };

  const handleOptionSelect = (option) => {
    if (multiple) {
      // Check if option is already selected
      const isSelected = selectedOptions.some(
        selected => (selected[optionValueKey] || selected) === (option[optionValueKey] || option)
      );
      
      let newSelectedOptions;
      if (isSelected) {
        // Remove from selection
        newSelectedOptions = selectedOptions.filter(
          selected => (selected[optionValueKey] || selected) !== (option[optionValueKey] || option)
        );
      } else {
        // Add to selection
        newSelectedOptions = [...selectedOptions, option];
      }
      
      setSelectedOptions(newSelectedOptions);
      
      // Update displayed text for multiple select
      const displayText = newSelectedOptions.length > 0
        ? newSelectedOptions.map(opt => opt[optionLabelKey] || opt).join(', ')
        : '';
      
      setLocalValue(displayText);
      
      // Call onChange with array of values
      if (onChange) {
        const values = newSelectedOptions.map(opt => opt[optionValueKey] || opt);
        const syntheticEvent = {
          target: { name, value: values },
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onChange(syntheticEvent);
      }
    } else {
      // Single select
      setSelectedOptions([option]);
      const displayValue = option[optionLabelKey] || option;
      setLocalValue(displayValue);
      
      // Close dropdown if configured to close on select
      if (closeOnSelect) {
        setIsDropdownOpen(false);
      }
      
      // Call onChange with the selected value
      if (onChange) {
        const optionValue = option[optionValueKey] || option;
        const syntheticEvent = {
          target: { name, value: optionValue },
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onChange(syntheticEvent);
      }
    }
    
    // Mark as changed
    if (!changedFields.includes('value')) {
      setChangedFields(prev => [...prev, 'value']);
    }
    
    // Clear search value if searchable
    if (searchable) {
      setSearchValue('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCreateOption = () => {
    if (creatable && searchValue && onOptionCreate) {
      const newOption = onOptionCreate(searchValue);
      if (newOption) {
        handleOptionSelect(newOption);
        setSearchValue('');
      }
    }
  };

  // Password toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Clear input field
  const handleClear = () => {
    if (isDropdown) {
      setSelectedOptions([]);
      setLocalValue('');
      
      // Call onChange with empty value
      if (onChange) {
        const syntheticEvent = {
          target: { name, value: multiple ? [] : '' },
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onChange(syntheticEvent);
      }
    } else {
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

  // Input change handler
  const handleChange = (e) => {
    if (isDropdown) {
      // Para dropdown, não permite alterações diretas de texto
      return;
    }
    
    // Obtém o valor do evento
    let newValue = e.target.value;
    
    // Extrai apenas os dígitos para números de telefone antes de qualquer manipulação
    // para poder passar isso de volta ao componente pai
    const digitsOnly = variant === 'phoneNumber' ? newValue.replace(/\D/g, '') : null;
    
    // Primeiro impede entrada de caracteres inválidos com base no variant
    newValue = preventInvalidInput(newValue, variant);
    
    // Depois aplica a máscara (formatação de exibição)
    if (variant && variant !== 'default') {
      newValue = applyMask(newValue, variant);
    } else if (mask) {
      newValue = applyMask(newValue, 'custom');
    }
    
    // Aplica formatação se permitido
    if (allowFormatting && !formatOnBlur) {
      newValue = formatValue(newValue, variant);
    }
    
    // Atualiza estado local com o valor formatado (para exibição)
    setLocalValue(newValue);
    
    // Chama onChange original com o valor apropriado
    if (onChange) {
      // Para campos de telefone, passa apenas os dígitos ao componente pai
      if (variant === 'phoneNumber' && digitsOnly !== null) {
        const syntheticEvent = { ...e, target: { ...e.target, value: digitsOnly, displayValue: newValue } };
        onChange(syntheticEvent);
      } else {
        const syntheticEvent = { ...e, target: { ...e.target, value: newValue } };
        onChange(syntheticEvent);
      }
    }
    
    // Valida durante digitação se habilitado
    if (validateOnChange && isTouched) {
      const validationError = validateValue(newValue);
      setLocalError(validationError);
    }
    
    // Marca como alterado
    if (!changedFields.includes('value')) {
      setChangedFields(prev => [...prev, 'value']);
    }
  };

  // Focus handler
  const handleFocus = (e) => {
    setIsFocused(true);
    setIsTouched(true);
    
    if (restProps.onFocus) {
      restProps.onFocus(e);
    }
    
    // Open dropdown on focus if it's a dropdown
    if (isDropdown && !isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  // Blur handler
  const handleBlur = (e) => {
    // Don't blur immediately for dropdowns to allow clicking options
    if (isDropdown) {
      // We'll handle this with the click outside listener
      return;
    }
    
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


  const preventInvalidInput = (value, variant) => {
    // Se não houver variant especificado, permite qualquer input
    if (!variant || variant === 'default') return value;
    
    switch (variant) {
      case 'phoneNumber':
     // Permite apenas números e alguns caracteres especiais para formatação
        return value.replace(/[^\d() -]/g, '');
        
      case 'number':
      case 'onlyNumbers':
        // Permite apenas números
        return value.replace(/[^\d]/g, '');
        
      case 'onlyLetters':
        // Permite apenas letras, incluindo acentuadas
        return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/g, '');
        
      case 'alphanumeric':
        // Permite letras e números
        return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 ]/g, '');
        
      case 'name':
        // Permite letras, espaços, apóstrofos, pontos e hífens
        return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'.-]/g, '');
        
      case 'email':
        // Validação básica para email - permite caracteres válidos em email
        return value.replace(/[^A-Za-z0-9@._+-]/g, '');
        
      case 'url':
        // Permite caracteres válidos em URL
        return value.replace(/[^A-Za-z0-9:/.?&=_-]/g, '');
        
      case 'cpf':
        // Permite apenas números e pontos/hífen para formatação
        return value.replace(/[^\d.-]/g, '');
        
      case 'cnpj':
        // Permite apenas números e pontos/hífen/barra para formatação
        return value.replace(/[^\d./-]/g, '');
        
      case 'cep':
        // Permite apenas números e hífen para formatação
        return value.replace(/[^\d-]/g, '');
        
      case 'rg':
        // Permite números, pontos, hífen e X (para RG)
        return value.replace(/[^\dXx.-]/g, '');
        
      case 'creditCard':
        // Permite apenas números, espaços e hífens
        return value.replace(/[^\d -]/g, '');
        
      case 'templateName':
        // Permite apenas letras minúsculas, números e underscore
        return value.replace(/[^a-z0-9_]/g, '');
        
      default:
        return value;
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
    isDropdown ? styles.isDropdown : '',
    isDropdownOpen ? styles.dropdownOpen : '',
    changedFields.includes('value') ? styles.changed : '',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    localError ? styles.inputError : '',
    isDropdown ? styles.dropdownInput : '',
    inputClassName
  ].filter(Boolean).join(' ');

  // Determine input type based on variant and settings
  const getInputType = () => {
    if (isDropdown) {
      return 'text';
    }
    
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
    if (type !== 'password' || isDropdown) return null;
    
    return (
      <button
        type="button"
        className={styles.visibilityToggle}
        onClick={togglePasswordVisibility}
        aria-label={showPassword}
        tabIndex="-1"
      >
        {showPassword ? (
          <FiEyeOff size={16} />
        ) : (
          <FiEye size={16} />
        )}
        <span>{showPassword ? "Esconder" : "Mostrar"}</span>
      </button>
    );
  };
  
  // Render dropdown toggle button
  const renderDropdownToggle = () => {
    if (!isDropdown) return null;
    
    return (
      <button
        type="button"
        className={styles.dropdownToggle}
        onClick={handleDropdownToggle}
        aria-label={isDropdownOpen ? "Close dropdown" : "Open dropdown"}
        tabIndex="-1"
        disabled={disabled || readOnly}
      >
        {isDropdownOpen ? (
          <FiChevronUp size={16} />
        ) : (
          <FiChevronDown size={16} />
        )}
      </button>
    );
  };
  
  // Render clear button
  const renderClearButton = () => {
    if (!clearable || (!localValue && selectedOptions.length === 0) || disabled || readOnly) return null;
    
    return (
      <button
        type="button"
        className={styles.clearButton}
        onClick={handleClear}
        aria-label="Clear input"
        tabIndex="-1"
      >
        <FiX />
      </button>
    );
  };

  // Render dropdown options
  const renderDropdownOptions = () => {
    if (!isDropdown || !isDropdownOpen) return null;
    
    const dropdownStyles = {
      maxHeight: dropdownMaxHeight,
      width: dropdownWidth || '100%'
    };
    
    const isOptionSelected = (option) => {
      return selectedOptions.some(
        selected => (selected[optionValueKey] || selected) === (option[optionValueKey] || option)
      );
    };
    
    return (
      <div 
        className={styles.dropdownOptions}
        style={dropdownStyles}
        ref={dropdownRef}
      >
        {searchable && (
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={handleSearchChange}
              className={styles.searchInput}
              autoFocus
            />
          </div>
        )}
        
        {filteredOptions.length > 0 ? (
          <ul className={styles.optionsList}>
            {filteredOptions.map((option, index) => {
              const optionLabel = option[optionLabelKey] || option;
              const optionValue = option[optionValueKey] || option;
              const selected = isOptionSelected(option);
              
              return (
                <li 
                  key={`${optionValue}-${index}`}
                  className={`${styles.option} ${selected ? styles.selectedOption : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {customOptionComponent ? (
                    customOptionComponent(option, selected)
                  ) : (
                    <>
                      {multiple && (
                        <input 
                          type="checkbox" 
                          checked={selected}
                          onChange={() => {}}
                          className={styles.optionCheckbox}
                        />
                      )}
                      <span className={styles.optionLabel}>{optionLabel}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.noOptions}>
            <p>{noOptionsMessage}</p>
            {creatable && searchValue && (
              <button 
                className={styles.createOption}
                onClick={handleCreateOption}
              >
                Criar "{searchValue}"
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render text formatting toolbar
  const renderFormatting = () => {
    if (isDropdown) return null;
    
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

  const renderBottomContent = () => {
    return (
      <div className={styles.bottomWrapper}>
        <div className={styles.bottomContent}>
        <div className={styles.hintWrapper}>
            {renderHintOrError()}
          </div>
          {showCharCounter && maxLength && !isDropdown && (
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
  };

  // Render hint or error message using the new Hints component
  const renderHintOrError = () => {
    if (!hintMessage && !localError) return null;
    
    if (localError) {
      return (
        <Hints
          variant="warning"
          message={localError}
          className={hintClassName}
          isAnimated={hintIsAnimated}
          isDismissable={hintIsDismissable}
          isImportant={hintIsImportant}
          isCompact={hintIsCompact}
          iconOverride={<FiAlertCircle size={hintIsCompact ? 14 : 18} />}
        />
      );
    }
    
    if (hintMessage) {
      return (
        <Hints
          variant={hintVariant}
          message={hintMessage}
          title={hintTitle}
          list={hintList}
          className={hintClassName}
          isAnimated={hintIsAnimated}
          isDismissable={hintIsDismissable}
          isImportant={hintIsImportant}
          isCompact={hintIsCompact}
          socialCount={hintSocialCount}
          actionText={hintActionText}
          actionCallback={hintActionCallback}
          onDismiss={hintOnDismiss}
          iconOverride={hintVariant === 'simple' ? <FiInfo size={hintIsCompact ? 12 : 16} /> : null}
        />
      );
    }
    
    return null;
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
          {!required && showOptionalBadge && (
            <span className={`${styles.optionalBadge} ${optionalBadgeClassName}`}>
              {optionalText}
            </span>
          )}
        </label>
      )}
      
      {!isDropdown && (textFormatting || toolbar) && (
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
        
        {isDropdown ? (
  <>
    <div className={`${styles.dropdownContainer} ${isDropdownOpen ? styles.open : ''}`} onClick={handleDropdownToggle}>
      <input
        ref={combinedRef}
        id={id}
        name={name}
        type="text"
        value={localValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={true}
        className={inputClasses}
        onFocus={handleFocus}
        required={required}
        {...restProps}
      />
      {renderDropdownOptions()}
    </div>
    {renderDropdownToggle()}
    </>
        ) : type === 'textarea' ? (
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
  
  {renderBottomContent()}
</div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  // Base props (identity and core functionality)
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'number', 'url', 'textarea', 'date', 'time', 'search']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array, // For multiple dropdown
    PropTypes.number,
    PropTypes.bool
  ]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  
  // Enhanced Hints specific props
  hintMessage: PropTypes.string,
  hintVariant: PropTypes.oneOf(['simple', 'info', 'warning', 'success', 'whatsapp', 'detailed']),
  hintTitle: PropTypes.string,
  hintList: PropTypes.arrayOf(PropTypes.string),
  hintIsDismissable: PropTypes.bool,
  hintIsAnimated: PropTypes.bool,
  hintIsImportant: PropTypes.bool,
  hintIsCompact: PropTypes.bool,
  hintSocialCount: PropTypes.number,
  hintActionText: PropTypes.string,
  hintActionCallback: PropTypes.func,
  hintOnDismiss: PropTypes.func,
  hintClassName: PropTypes.string,
  
  // Display configuration
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  clearable: PropTypes.bool,
  
  // Decoration elements
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  rightElement: PropTypes.node,
  leftElement: PropTypes.node,
  toolbar: PropTypes.node,
  
  // Validation and formatting
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
  allowFormatting: PropTypes.bool,
  formatOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  
  // Character counter
  showCharCounter: PropTypes.bool,
  showCounterFormatting: PropTypes.bool,
  characterCounterVariant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  
  // Text formatter
  textFormatting: PropTypes.bool,
  textFormattingCompact: PropTypes.bool,
  textFormattingDarkMode: PropTypes.bool,
  textFormattingShowHint: PropTypes.bool,
  
  // Dropdown functionality
  isDropdown: PropTypes.bool,
  options: PropTypes.array,
  optionLabelKey: PropTypes.string,
  optionValueKey: PropTypes.string,
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  creatable: PropTypes.bool,
  noOptionsMessage: PropTypes.string,
  onOptionCreate: PropTypes.func,
  customOptionComponent: PropTypes.func,
  dropdownWidth: PropTypes.string,
  dropdownMaxHeight: PropTypes.string,
  closeOnSelect: PropTypes.bool,

  // Optional badge props
  showOptionalBadge: PropTypes.bool,
  optionalText: PropTypes.string,
  optionalBadgeClassName: PropTypes.string,
};

export default Input;