// components/editors/ButtonEditor.js
import React, { useState, useEffect } from 'react';
import { FiLink, FiPhone, FiMessageSquare, FiInfo, FiAlertCircle, FiCheckCircle, FiExternalLink, FiLock, FiUnlock } from 'react-icons/fi';
import styles from './ButtonEditor.module.css';
import Input from '../ui/Input/Input';

/**
 * ButtonEditor - Enhanced component for editing WhatsApp template buttons
 * Now with button type synchronization across all cards
 * 
 * @param {Object} props Component properties
 * @param {number} props.index Card index
 * @param {number} props.buttonIndex Button index within the card
 * @param {Object} props.button Button data
 * @param {Function} props.updateButtonField Function to update button fields
 * @param {Function} props.removeButton Function to remove the button
 * @param {number} props.totalButtons Total number of buttons in the card
 * @param {boolean} props.showHints Whether to show helpful hints
 * @param {string} props.validationMessage Validation error message if any
 * @param {Array} props.cards All carousel cards
 * @param {number} props.numCards Number of active cards
 * @param {Function} props.syncButtonTypes Function to sync button types across all cards
 * @returns {JSX.Element} ButtonEditor component
 */
const ButtonEditor = ({ 
  index, 
  buttonIndex, 
  button, 
  updateButtonField, 
  removeButton, 
  totalButtons, 
  showHints = true,
  validationMessage,
  cards,
  numCards,
  syncButtonTypes
}) => {
  // State for UI interactions
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showPhoneHelp, setShowPhoneHelp] = useState(false);
  const [urlTested, setUrlTested] = useState(false);
  const [phoneTested, setPhoneTested] = useState(false);
  const [isTypeLocked, setIsTypeLocked] = useState(true);
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  
  // Effect to detect if this is the first card with this button index
  // If not, we lock the button type selection (it should follow the first card)
  useEffect(() => {
    // Only lock if there are multiple cards and this isn't the first card
    const shouldLock = numCards > 1 && index > 0;
    setIsTypeLocked(shouldLock);
  }, [numCards, index]);
  
  // Field validation
  const isTextValid = !!button.text;
  const isUrlValid = button.type !== 'URL' || !!button.url;
  const isPhoneValid = button.type !== 'PHONE_NUMBER' || !!button.phoneNumber;
  
  // Character count tracking
  const textLength = button.text ? button.text.length : 0;
  const maxTextLength = 25;
  const isTextWarning = textLength > 15;
  const textPercentage = Math.min((textLength / maxTextLength) * 100, 100);
  
  // Phone number formatting helper
  const formatPhoneNumber = (value) => {
    // Remove todos os caracteres que não sejam números ou "+"
    let cleaned = value.replace(/[^\d+]/g, '');
  
    // Garante que "+" aparece apenas no começo
    if (cleaned.startsWith('+')) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    } else {
      cleaned = cleaned.replace(/\+/g, ''); // Remove "+" extras
    }
  
    return cleaned;
  };
  
  // URL validation check with proper protocol
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Test URL link with visual feedback
  const testUrl = () => {
    if (button.url && isValidUrl(button.url)) {
      window.open(button.url, '_blank', 'noopener,noreferrer');
      setUrlTested(true);
      setTimeout(() => setUrlTested(false), 3000);
    }
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\\D/g, '');
    if (cleaned.length < 7) return phone;
    
    // Simple formatting for readability
    const countryCode = cleaned.substring(0, 2);
    const areaCode = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9);
    
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  };

  // Test phone number click action
  const testPhoneNumber = () => {
    if (button.phoneNumber) {
      window.location.href = `tel:${button.phoneNumber}`;
      setPhoneTested(true);
      setTimeout(() => setPhoneTested(false), 3000);
    }
  };
  
  // Handle button type change with synchronization
  const handleButtonTypeChange = (newType) => {
    if (isTypeLocked && !window.confirm("Alterar o tipo deste botão irá sincronizar todos os botões nesta posição em todos os cards. Deseja continuar?")) {
      return;
    }
    
    // If first card and multiple cards exist, show warning about syncing
    if (index === 0 && numCards > 1 && !showSyncWarning) {
      setShowSyncWarning(true);
      setTimeout(() => setShowSyncWarning(false), 5000);
    }
    
    // Check if we need to sync across all cards
    if (numCards > 1) {
      // First update this button
      updateButtonField(buttonIndex, 'type', newType);
      
      // Then sync with all other cards
      if (syncButtonTypes) {
        syncButtonTypes(buttonIndex, newType);
      }
    } else {
      // Just update this button
      updateButtonField(buttonIndex, 'type', newType);
    }
  };
  
  // Handle button removal with synchronization
  const handleRemoveButton = () => {
    if (numCards > 1 && !window.confirm("Remover este botão irá remover o botão correspondente em todos os cards. Deseja continuar?")) {
      return;
    }
    
    removeButton(buttonIndex);
  };
  
  // Button type configuration with icons and descriptions
  const buttonTypes = [
    { 
      value: 'URL', 
      label: 'Abrir Link', 
      icon: <FiLink size={20} />,
      description: 'Leva o usuário para um site externo.'
    },
    { 
      value: 'QUICK_REPLY', 
      label: 'Resposta Rápida', 
      icon: <FiMessageSquare size={20} />,
      description: 'Envia uma mensagem pronta ao clicar.'
    },
    { 
      value: 'PHONE_NUMBER', 
      label: 'Ligação', 
      icon: <FiPhone size={20} />,
      description: 'Inicia uma chamada telefônica instantaneamente.'
    }
  ];
  

  return (
    <div className={`${styles.buttonContainer} ${validationMessage ? styles.invalidContainer : ''}`}>
      {/* WhatsApp Sync Notice */}
      {showSyncWarning && index === 0 && numCards > 1 && (
        <div className={styles.syncWarning}>
          <FiInfo size={16} />
          <span>
          O WhatsApp exige que todos os cards tenham os mesmos botões na mesma posição. Se alterar este botão, todas as outras versões serão ajustadas automaticamente.
          </span>
        </div>
      )}
    
      {/* Button Type Selector */}
      <div className={styles.buttonTypeSelector}>
        {buttonTypes.map(type => (
          <div 
            key={type.value}
            className={`
              ${styles.typeOption} 
              ${button.type === type.value ? styles.selectedType : ''} 
              ${isTypeLocked && type.value !== button.type ? styles.disabledType : ''}
            `}
            onClick={() => handleButtonTypeChange(type.value)}
          >
            <div className={styles.typeIconWrapper}>
              {type.icon}
              {isTypeLocked && index > 0 && (
                <div className={styles.lockIndicator}>
                  <FiLock size={12} />
                </div>
              )}
            </div>
            <span className={styles.typeLabel}>{type.label}</span>
          </div>
        ))}
      </div>
      
      {/* WhatsApp Requirement Notice */}
      {isTypeLocked && index > 0 && showHints && (
        <div className={styles.syncNotice}>
          <FiInfo size={14} />
          <span>
          O tipo deste botão segue a configuração do primeiro card, conforme as regras do WhatsApp.
          </span>
        </div>
      )}
      
      {/* Type Description */}
      {showHints && (
        <div className={styles.typeDescription}>
          {buttonTypes.find(t => t.value === button.type)?.description}
        </div>
      )}
      

         <Input
          id="buttonText"
          name="ButtonText"
          label="Texto do Botão"
          value={button.text || ''}
          onChange={(e) => updateButtonField(buttonIndex, 'text', e.target.value)}
          placeholder="Exemplos: Saiba mais, Comprar agora, etc."
          required
          minLength={1}
          maxLength={maxTextLength}
          error={false}
          hint="Texto exibido no botão. Máximo de 25 caracteres."
          // icon={showHints ? <FiInfo /> : null}
          allowFormatting={false}
          textFormatting={false} // Habilita a barra de formatação
          textFormattingCompact={false} // Opcional: tamanho normal
          textFormattingDarkMode={false} // Opcional: tema claro
          showCharCounter
        />
      
      {/* URL Field - only shown for URL type buttons */}
      {button.type === 'URL' && (
        <div className={styles.formGroup}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>
              Destination URL
              <span className={styles.requiredMark}>*</span>
            </label>
            <button 
              type="button" 
              className={styles.helpButton}
              onClick={() => setShowUrlHelp(!showUrlHelp)}
            >
              {showUrlHelp ? "Hide Help" : "Show Help"}
            </button>
          </div>
          <div className={styles.urlInputWrapper}>
            <input 
              type="url"
              className={`${styles.input} ${!isUrlValid && button.url !== '' ? styles.invalidInput : ''}`}
              value={button.url || ''}
              onChange={(e) => updateButtonField(buttonIndex, 'url', e.target.value)}
              placeholder="https://example.com/page"
            />
            {button.url && (
              <button 
                type="button"
                className={styles.testActionButton}
                onClick={testUrl}
                disabled={!isValidUrl(button.url)}
                title={isValidUrl(button.url) ? "Test this URL" : "Invalid URL format"}
              >
                {urlTested ? (
                  <>
                    <FiCheckCircle size={14} />
                    <span>Opened</span>
                  </>
                ) : (
                  <>
                    <FiExternalLink size={14} />
                    <span>Test</span>
                  </>
                )}
              </button>
            )}
          </div>
          {/* URL Validation Warning */}
          {button.url && !isValidUrl(button.url) && (
            <div className={styles.urlWarning}>
              <FiAlertCircle size={14} />
              Invalid URL. Make sure to include "https://" or "http://"
            </div>
          )}
          {/* URL Help Section */}
          {showUrlHelp && (
            <div className={styles.helpContent}>
              <h4>How to create a good link:</h4>
              <ul>
                <li>Always use HTTPS when possible (more secure)</li>
                <li>Full URL must include "https://" at the beginning</li>
                <li>Avoid unreliable URL shorteners</li>
                <li>Test the link before saving</li>
              </ul>
              <div className={styles.exampleBox}>
                <strong>Valid examples:</strong>
                <code>https://www.example.com</code>
                <code>https://example.com/product?id=123</code>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Quick Reply Payload Field */}
      {button.type === 'QUICK_REPLY' && (
        <div className={styles.formGroup}>
        
          <Input
            type="text"
            name="OptinalPayload"
            label="Payload"
            hint="The payload is the text that will be sent to your system when the user clicks the button."
            useHintComponent={true}
            hintVariant="detailed"
            value={button.payload || ''}
            onChange={(e) => updateButtonField(buttonIndex, 'payload', e.target.value)}
            placeholder="Leave empty to use the button text as payload"
          />
        </div>
      )}
      
      {/* Phone Number Field */}
      {button.type === 'PHONE_NUMBER' && (
        <div className={styles.formGroup}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>
              Phone Number
              <span className={styles.requiredMark}>*</span>
            </label>
            <button 
              type="button" 
              className={styles.helpButton}
              onClick={() => setShowPhoneHelp(!showPhoneHelp)}
            >
              {showPhoneHelp ? "Hide Help" : "Show Help"}
            </button>
          </div>
          <div className={styles.phoneInputWrapper}>
            <input 
              type="tel"
              className={`${styles.input} ${!isPhoneValid && button.phoneNumber !== '' ? styles.invalidInput : ''}`}
              value={button.phoneNumber || ''}
              onChange={(e) => updateButtonField(buttonIndex, 'phoneNumber', formatPhoneNumber(e.target.value))}
              placeholder="+5521999999999"
            />
            {button.phoneNumber && (
              <button 
                type="button"
                className={styles.testActionButton}
                onClick={testPhoneNumber}
                title="Test this phone number"
              >
                {phoneTested ? (
                  <>
                    <FiCheckCircle size={14} />
                    <span>Called</span>
                  </>
                ) : (
                  <>
                    <FiPhone size={14} />
                    <span>Test</span>
                  </>
                )}
              </button>
            )}
          </div>
          {/* Phone Number Preview */}
          {button.phoneNumber && (
            <div className={styles.phonePreview}>
              {formatPhoneDisplay(button.phoneNumber)}
            </div>
          )}
          {/* Phone Help Section */}
          {showPhoneHelp && (
            <div className={styles.helpContent}>
              <h4>Phone number format:</h4>
              <ul>
                <li>Use international format with "+" at the beginning</li>
                <li>Include the country code (Brazil: 55)</li>
                <li>Include the area code without the zero</li>
                <li>Do not use spaces, parentheses, or hyphens</li>
              </ul>
              <div className={styles.exampleBox}>
                <strong>Valid examples:</strong>
                <code>+5521999999999</code>
                <code>+551140042222</code>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Remove Button - only shown if there's more than 1 button */}
      {totalButtons > 1 && (
        <div className={styles.buttonActions}>
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemoveButton}
          >
            {numCards > 1 ? "Remove Button in All Cards" : "Remove Button"}
          </button>
        </div>
      )}
      
      {/* Validation message */}
      {validationMessage && (
        <div className={styles.validationMessage}>
          <FiAlertCircle className={styles.validationIcon} />
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default ButtonEditor;