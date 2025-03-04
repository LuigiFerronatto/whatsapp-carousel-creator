// components/editors/ButtonEditor.js
import React, { useState } from 'react';
import { FiLink, FiPhone, FiMessageSquare, FiInfo, FiAlertCircle, FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import styles from './ButtonEditor.module.css';

/**
 * ButtonEditor - Enhanced component for editing WhatsApp template buttons
 * Improved UI/UX with standardized design system
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
  validationMessage 
}) => {
  // State for UI interactions
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showPhoneHelp, setShowPhoneHelp] = useState(false);
  const [urlTested, setUrlTested] = useState(false);
  const [phoneTested, setPhoneTested] = useState(false);
  
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
  
  // Button type configuration with icons and descriptions
  const buttonTypes = [
    { 
      value: 'URL', 
      label: 'Link URL', 
      icon: <FiLink size={20} />,
      description: 'Opens a link in an external browser when clicked'
    },
    { 
      value: 'QUICK_REPLY', 
      label: 'Quick Reply', 
      icon: <FiMessageSquare size={20} />,
      description: 'Sends a pre-defined response when clicked'
    },
    { 
      value: 'PHONE_NUMBER', 
      label: 'Phone', 
      icon: <FiPhone size={20} />,
      description: 'Initiates a phone call when clicked'
    }
  ];

  return (
    <div className={`${styles.buttonContainer} ${validationMessage ? styles.invalidContainer : ''}`}>
      {/* Button Type Selector */}
      <div className={styles.buttonTypeSelector}>
        {buttonTypes.map(type => (
          <div 
            key={type.value}
            className={`${styles.typeOption} ${button.type === type.value ? styles.selectedType : ''}`}
            onClick={() => updateButtonField(buttonIndex, 'type', type.value)}
          >
            <div className={styles.typeIconWrapper}>
              {type.icon}
            </div>
            <span className={styles.typeLabel}>{type.label}</span>
          </div>
        ))}
      </div>
      
      {/* Type Description */}
      {showHints && (
        <div className={styles.typeDescription}>
          {buttonTypes.find(t => t.value === button.type)?.description}
        </div>
      )}
      
      {/* Button Text Field */}
      <div className={styles.formGroup}>
        <div className={styles.labelWithProgress}>
          <label className={styles.label}>
            Button Text
            <span className={styles.requiredMark}>*</span>
          </label>
          <div className={styles.characterProgressWrapper}>
            <div 
              className={`${styles.characterProgress} ${isTextWarning ? styles.warningProgress : ''}`}
              style={{ width: `${textPercentage}%` }}
            ></div>
            <span className={`${styles.charCount} ${isTextWarning ? styles.warningCount : ''}`}>
              {textLength}/{maxTextLength}
            </span>
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <input 
            type="text"
            className={`${styles.input} ${!isTextValid && button.text !== '' ? styles.invalidInput : ''}`}
            value={button.text}
            onChange={(e) => updateButtonField(buttonIndex, 'text', e.target.value)}
            placeholder="Example: Learn More, Buy Now, etc."
            maxLength={maxTextLength}
          />
        </div>
        {showHints && (
          <div className={styles.fieldHint}>
            <FiInfo className={styles.infoIcon} />
            <span>Keep text short and clear. Buttons with 1-2 words look best.</span>
          </div>
        )}
      </div>
      
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
          <label className={styles.label}>
            Payload
            <span className={styles.optionalBadge}>Optional</span>
          </label>
          <input 
            type="text"
            className={styles.input}
            value={button.payload || ''}
            onChange={(e) => updateButtonField(buttonIndex, 'payload', e.target.value)}
            placeholder="Leave empty to use the button text as payload"
          />
          {showHints && (
            <div className={styles.fieldHint}>
              <FiInfo className={styles.infoIcon} />
              <span>The payload is the text that will be sent to your system when the user clicks the button.</span>
            </div>
          )}
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
            onClick={() => removeButton(buttonIndex)}
          >
            Remove Button
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