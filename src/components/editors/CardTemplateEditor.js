// components/editors/CardTemplateEditor.js
import React, { useState, useEffect } from 'react';
import ButtonEditor from './ButtonEditor';
import { FiMaximize2, FiMinimize2, FiEye, FiEyeOff, FiAlertCircle, FiEdit, FiLink, FiPhone, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import styles from './CardTemplateEditor.module.css';

const CardTemplateEditor = ({ 
  id, 
  index, 
  card, 
  cards, 
  updateCard,
  showHints = true,
  validationMessage 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('text');
  const [changedFields, setChangedFields] = useState([]);
  
  // Reset changed fields indicator after some time
  useEffect(() => {
    if (changedFields.length > 0) {
      const timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [changedFields]);
  
  // Character count for card body text
  const textLength = card.bodyText ? card.bodyText.length : 0;
  const maxTextLength = 160;
  const textPercentage = Math.min((textLength / maxTextLength) * 100, 100);
  const isTextWarning = textLength > 120;
  const isTextDanger = textLength > 150;
  const isTextValid = !!card.bodyText;
  
  // Function to update card text with tracking changes
  const handleBodyTextChange = (e) => {
    updateCard(index, 'bodyText', e.target.value);
    if (!changedFields.includes('bodyText')) {
      setChangedFields([...changedFields, 'bodyText']);
    }
  };

  // Function to update the buttons
  const updateButtons = (newButtons) => {
    updateCard(index, 'buttons', newButtons);
    if (!changedFields.includes('buttons')) {
      setChangedFields([...changedFields, 'buttons']);
    }
  };

  // Add a new button
  const addButton = () => {
    if (card.buttons.length < 2) {
      const newButtons = [...card.buttons, { type: 'QUICK_REPLY', text: '' }];
      updateButtons(newButtons);
    }
  };

  // Remove a button
  const removeButton = (buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    updateButtons(newButtons);
  };

  // Update a specific field of a button
  const updateButtonField = (buttonIndex, field, value) => {
    const newButtons = [...card.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
    updateButtons(newButtons);
  };

  // Generate color based on index for the card indicator
  const getCardColor = () => {
    const colors = [
      'var(--blip-light)',
      'var(--magic-mint)',
      'var(--marigold-yellow)',
      'var(--romantic)',
      'var(--perfume)'
    ];
    return colors[index % colors.length];
  };

  // Function to copy the file handle to clipboard
  const copyFileHandle = () => {
    if (card.fileHandle) {
      navigator.clipboard.writeText(card.fileHandle)
        .then(() => {
          setCopySuccess(true);
          // Reset success message after 2 seconds
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Error copying:', err);
        });
    }
  };

  // Get appropriate icon for button type
  const getButtonTypeIcon = (type) => {
    switch (type) {
      case 'URL':
        return <FiLink />;
      case 'PHONE_NUMBER':
        return <FiPhone />;
      case 'QUICK_REPLY':
      default:
        return <FiMessageSquare />;
    }
  };

  return (
    <div 
      id={id} 
      className={`${styles.cardContainer} ${validationMessage ? styles.invalidCard : ''} ${isExpanded ? '' : styles.collapsedCard}`}
      style={{ borderLeftColor: getCardColor() }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleSection}>
          <h3 className={styles.cardTitle}>
            Card {index + 1}
            <span className={styles.cardIndicator} style={{ backgroundColor: getCardColor() }}></span>
          </h3>
          
          {card.fileHandle && (
            <div className={styles.fileHandleInfo}>
              <span className={styles.fileHandleLabel}>File Handle:</span> 
              <div className={styles.fileHandleWrapper}>
                <span className={styles.fileHandleValue}>{card.fileHandle}</span>
                <button 
                  className={styles.copyButton}
                  onClick={copyFileHandle}
                  title="Copy File Handle"
                  aria-label="Copy File Handle"
                >
                  {copySuccess ? (
                    <>
                      <FiCheckCircle className={styles.copyIcon} />
                      <span className={styles.tooltipText}>Copied!</span>
                    </>
                  ) : (
                    <FiLink className={styles.copyIcon} />
                  )}
                </button>
              </div>
              
              {card.fileType === 'image' && (
                <button 
                  className={styles.previewButton}
                  onClick={() => setShowImagePreview(!showImagePreview)}
                >
                  {showImagePreview ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  {showImagePreview ? 'Hide Image' : 'View Image'}
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.cardActions}>
          {validationMessage && (
            <div className={styles.validationBadge} title={validationMessage}>
              <FiAlertCircle size={16} />
            </div>
          )}
          
          <button 
            className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse card" : "Expand card"}
          >
            {isExpanded ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
          </button>
        </div>
      </div>
      
      {validationMessage && (
        <div className={styles.validationMessage}>
          <FiAlertCircle className={styles.warningIcon} />
          {validationMessage}
        </div>
      )}
      
      {showImagePreview && card.fileUrl && card.fileType === 'image' && (
        <div className={styles.imagePreviewContainer}>
          <img 
            src={card.fileUrl} 
            alt={`Preview of card ${index + 1}`} 
            className={styles.imagePreview}
          />
          <button 
            className={styles.closePreviewButton}
            onClick={() => setShowImagePreview(false)}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
      )}
      
      {isExpanded && (
        <div className={styles.cardContent}>
          <div className={styles.editorTabs}>
            <button 
              className={`${styles.editorTab} ${activeSection === 'text' ? styles.activeTab : ''}`}
              onClick={() => setActiveSection('text')}
            >
              <FiEdit size={16} />
              Card Text
            </button>
            <button 
              className={`${styles.editorTab} ${activeSection === 'buttons' ? styles.activeTab : ''}`}
              onClick={() => setActiveSection('buttons')}
            >
              <FiMessageSquare size={16} />
              Buttons
              <span className={styles.buttonCount}>({card.buttons.length}/2)</span>
            </button>
          </div>
          
          {activeSection === 'text' && (
            <div className={styles.cardFieldSection}>
              <div className={styles.fieldHeader}>
                <label className={styles.fieldLabel} htmlFor={`card-${index}-text`}>
                  Card Text
                  <span className={styles.requiredMark}>*</span>
                </label>
                <div className={styles.characterCountWrapper}>
                  <div 
                    className={`${styles.characterProgress} ${isTextWarning ? styles.warningProgress : ''} ${isTextDanger ? styles.dangerProgress : ''}`}
                    style={{ width: `${textPercentage}%` }}
                  ></div>
                  <span 
                    className={`${styles.characterCount} ${isTextWarning ? styles.warningCount : ''} ${isTextDanger ? styles.dangerCount : ''}`}
                  >
                    {textLength}/{maxTextLength}
                  </span>
                </div>
              </div>
              
              <textarea 
                id={`card-${index}-text`}
                className={`${styles.textarea} ${!isTextValid && card.bodyText !== '' ? styles.invalidInput : ''} ${changedFields.includes('bodyText') ? styles.changedField : ''}`}
                rows="3"
                value={card.bodyText}
                onChange={handleBodyTextChange}
                placeholder="Description of the product or service that will appear in this card. Be clear and concise."
                maxLength={maxTextLength}
              ></textarea>
              
              {showHints && (
                <div className={styles.textHint}>
                  <div className={styles.hintIconWrapper}>
                    <FiAlertCircle className={styles.hintIcon} />
                  </div>
                  <div>
                    <p><strong>Tips for good card text:</strong></p>
                    <ul>
                      <li>Keep between 60-120 characters for best visibility</li>
                      <li>Highlight key benefits or features</li>
                      <li>Avoid repeating information already in the image</li>
                      <li>Use clear calls-to-action to direct users to buttons</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'buttons' && (
            <div className={styles.buttonsSection}>
              {card.buttons.length > 0 ? (
                <div className={styles.buttonsList}>
                  {card.buttons.map((button, buttonIndex) => (
                    <div key={buttonIndex} className={`${styles.buttonItem} ${changedFields.includes('buttons') ? styles.changedField : ''}`}>
                      <div className={styles.buttonHeader}>
                        <div className={styles.buttonType}>
                          {getButtonTypeIcon(button.type)}
                          <span className={styles.buttonTypeText}>{button.type.replace('_', ' ')}</span>
                        </div>
                        {card.buttons.length > 1 && (
                          <button 
                            onClick={() => removeButton(buttonIndex)}
                            className={styles.removeButtonAction}
                            aria-label="Remove button"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <ButtonEditor 
                        key={buttonIndex}
                        index={index}
                        buttonIndex={buttonIndex}
                        button={button}
                        updateButtonField={updateButtonField}
                        removeButton={() => removeButton(buttonIndex)}
                        totalButtons={card.buttons.length}
                        showHints={showHints}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noButtonsMessage}>
                  No buttons added yet. Buttons are required for each card.
                </div>
              )}
              
              {card.buttons.length < 2 && (
                <button 
                  onClick={addButton}
                  className={styles.addButton}
                >
                  + Add Button
                </button>
              )}
              
              {showHints && (
                <div className={styles.buttonHint}>
                  <div className={styles.hintIconWrapper}>
                    <FiAlertCircle className={styles.hintIcon} />
                  </div>
                  <div>
                    <p><strong>Button best practices:</strong></p>
                    <ul>
                      <li>Use clear, actionable text (e.g., "Buy Now", "Learn More")</li>
                      <li>Keep button text under 20 characters</li>
                      <li>Each card can have up to 2 buttons</li>
                      <li>For URLs, always include https:// prefix</li>
                      <li>For phone numbers, use international format (+XXXXXXXXXXX)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {!isExpanded && (
        <div className={styles.collapsedPreview}>
          <div className={styles.collapsedField}>
            <span className={styles.collapsedLabel}>Text:</span>
            <span className={styles.collapsedValue}>
              {card.bodyText ? 
                (card.bodyText.length > 40 ? card.bodyText.substring(0, 40) + '...' : card.bodyText) : 
                <em className={styles.emptyText}>Not defined</em>}
            </span>
          </div>
          <div className={styles.collapsedField}>
            <span className={styles.collapsedLabel}>Buttons:</span>
            <span className={styles.collapsedValue}>
              {card.buttons.length > 0 ? 
                card.buttons.map(b => b.text || 'No text').join(', ') : 
                <em className={styles.emptyText}>No buttons</em>}
            </span>
          </div>
          {validationMessage && (
            <div className={styles.collapsedValidation}>
              <FiAlertCircle size={14} className={styles.validationIcon} />
              <span className={styles.validationText}>{validationMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardTemplateEditor;