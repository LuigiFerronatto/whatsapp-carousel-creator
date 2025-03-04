// components/editors/CardTemplateEditor.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ButtonEditor from './ButtonEditor';
import { 
  FiMaximize2, 
  FiMinimize2, 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle, 
  FiLink, 
  FiCheck, 
  FiMessageSquare,
  FiPlus,
  FiInfo,
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiHash,
  FiCornerUpRight
} from 'react-icons/fi';
import styles from './CardTemplateEditor.module.css';

/**
 * Enhanced Card Template Editor Component
 * 
 * @param {Object} props Component properties
 * @param {string} props.id Unique ID for the card
 * @param {number} props.index Index of the card in the array
 * @param {Object} props.card Card data
 * @param {Array} props.cards Array of all cards
 * @param {Function} props.updateCard Function to update card data
 * @param {boolean} props.showHints Whether to show helpful hints
 * @param {string} props.validationMessage Validation error message if any
 * @returns {JSX.Element} Card Template Editor component
 */
const CardTemplateEditor = ({ 
  id, 
  index, 
  card, 
  cards, 
  updateCard,
  showHints = true,
  validationMessage 
}) => {
  // Local state
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('text');
  const [changedFields, setChangedFields] = useState([]);
  const textareaRef = useRef(null);
  
  // Clear changed fields highlighting after a delay
  useEffect(() => {
    if (changedFields.length > 0) {
      const timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [changedFields]);
  
  // Basic text validations with visual feedback
  const textLength = card.bodyText ? card.bodyText.length : 0;
  const maxTextLength = 160;
  const textPercentage = Math.min((textLength / maxTextLength) * 100, 100);
  const isTextWarning = textLength > 120;
  const isTextDanger = textLength > 150;
  const isTextValid = !!card.bodyText;
  
  // Update card text with change tracking
  const handleBodyTextChange = useCallback((e) => {
    updateCard(index, 'bodyText', e.target.value);
    if (!changedFields.includes('bodyText')) {
      setChangedFields(prev => [...prev, 'bodyText']);
    }
  }, [updateCard, index, changedFields]);

  // Update buttons data
  const updateButtons = useCallback((newButtons) => {
    updateCard(index, 'buttons', newButtons);
    if (!changedFields.includes('buttons')) {
      setChangedFields(prev => [...prev, 'buttons']);
    }
  }, [updateCard, index, changedFields]);

  // Add a new button to the card
  const addButton = useCallback(() => {
    if (card.buttons.length < 2) {
      const newButtons = [...card.buttons, { type: 'QUICK_REPLY', text: '' }];
      updateButtons(newButtons);
    }
  }, [card.buttons, updateButtons]);

  // Remove a button from the card
  const removeButton = useCallback((buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    updateButtons(newButtons);
  }, [card.buttons, updateButtons]);

  // Update a specific field of a button
  const updateButtonField = useCallback((buttonIndex, field, value) => {
    const newButtons = [...card.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
    updateButtons(newButtons);
  }, [card.buttons, updateButtons]);

  // Generate color based on card index for visual distinction
  const getCardColor = useCallback(() => {
    const colors = [
      'var(--blip-action)',
      'var(--mountain-meadow)',
      'var(--marigold-yellow)',
      'var(--chilean-fire)',
      'var(--windsor)'
    ];
    return colors[index % colors.length];
  }, [index]);

  // Copy file handle to clipboard
  const copyFileHandle = useCallback(() => {
    if (card.fileHandle) {
      navigator.clipboard.writeText(card.fileHandle)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Error copying:', err);
        });
    }
  }, [card.fileHandle]);
  
  // Inserir formatação no texto selecionado
  const insertFormatting = (format) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = card.bodyText ? card.bodyText.substring(start, end) : '';
    let newText = card.bodyText || '';
    let newPosition = end;

    switch (format) {
      case 'bold':
        newText = newText.substring(0, start) + '*' + selectedText + '*' + newText.substring(end);
        newPosition = end + 2;
        break;
      case 'italic':
        newText = newText.substring(0, start) + '_' + selectedText + '_' + newText.substring(end);
        newPosition = end + 2;
        break;
      case 'strikethrough':
        newText = newText.substring(0, start) + '~' + selectedText + '~' + newText.substring(end);
        newPosition = end + 2;
        break;
      case 'code':
        newText = newText.substring(0, start) + '```' + selectedText + '```' + newText.substring(end);
        newPosition = end + 6;
        break;
      case 'bullet':
        // Adiciona lista com marcadores
        const bulletText = selectedText ? 
          selectedText.split('\n').map(line => `* ${line}`).join('\n') :
          '* ';
        newText = newText.substring(0, start) + bulletText + newText.substring(end);
        newPosition = start + bulletText.length;
        break;
      case 'numbered':
        // Adiciona lista numerada
        const numberedText = selectedText ? 
          selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') :
          '1. ';
        newText = newText.substring(0, start) + numberedText + newText.substring(end);
        newPosition = start + numberedText.length;
        break;
      case 'quote':
        // Adiciona citação
        const quoteText = selectedText ? 
          selectedText.split('\n').map(line => `> ${line}`).join('\n') :
          '> ';
        newText = newText.substring(0, start) + quoteText + newText.substring(end);
        newPosition = start + quoteText.length;
        break;
      case 'inline-code':
        // Código inline
        newText = newText.substring(0, start) + '`' + selectedText + '`' + newText.substring(end);
        newPosition = end + 2;
        break;
      case 'newline':
        newText = newText.substring(0, start) + '\n' + newText.substring(end);
        newPosition = start + 1;
        break;
      default:
        break;
    }

    updateCard(index, 'bodyText', newText);
    if (!changedFields.includes('bodyText')) {
      setChangedFields(prev => [...prev, 'bodyText']);
    }

    // Reposiciona o cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Render card text input panel
  const renderTextPanel = () => (
    <div className={styles.cardFieldSection}>
      <div className={styles.fieldHeader}>
        <label className={styles.fieldLabel} htmlFor={`card-${index}-text`}>
          Card Text
          <span className={styles.requiredMark}>*</span>
        </label>
        <div className={styles.characterCountWrapper}>
          <div 
            className={`
              ${styles.characterProgress} 
              ${isTextWarning ? styles.warningProgress : ''} 
              ${isTextDanger ? styles.dangerProgress : ''}
            `}
            style={{ width: `${textPercentage}%` }}
          ></div>
          <span 
            className={`
              ${styles.characterCount} 
              ${isTextWarning ? styles.warningCount : ''} 
              ${isTextDanger ? styles.dangerCount : ''}
            `}
          >
            {textLength}/{maxTextLength}
          </span>
        </div>
      </div>
      
      {/* Barra de ferramentas de formatação */}
      <div className={styles.formattingToolbar}>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('bold')}
          title="Negrito (*texto*)"
        >
          <FiBold size={16} />
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('italic')}
          title="Itálico (_texto_)"
        >
          <FiItalic size={16} />
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('strikethrough')}
          title="Tachado (~texto~)"
        >
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>~</span>
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('bullet')}
          title="Lista com marcadores (* texto)"
        >
          <FiList size={16} />
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('numbered')}
          title="Lista numerada (1. texto)"
        >
          <FiHash size={16} />
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('quote')}
          title="Citação (> texto)"
        >
          <FiCornerUpRight size={16} />
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('inline-code')}
          title="Código inline (`texto`)"
        >
          <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>`</span>
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('code')}
          title="Bloco de código (```texto```)"
        >
          <FiCode size={16} />
        </button>
        <button 
          type="button"
          className={styles.formatButton}
          onClick={() => insertFormatting('newline')}
          title="Quebra de linha"
        >
          ¶
        </button>
      </div>
      
      <textarea 
        id={`card-${index}-text`}
        ref={textareaRef}
        className={`
          ${styles.textarea} 
          ${!isTextValid && card.bodyText !== '' ? styles.invalidInput : ''} 
          ${changedFields.includes('bodyText') ? styles.changedField : ''}
        `}
        rows="3"
        value={card.bodyText || ''}
        onChange={handleBodyTextChange}
        placeholder="Description of the product or service that will appear in this card. Be clear and concise."
        maxLength={maxTextLength}
      ></textarea>
      
      {showHints && (
        <div className={styles.textHint}>
          <div className={styles.hintIconWrapper}>
            <FiInfo className={styles.hintIcon} />
          </div>
          <div>
            <p><strong>Tips for good card text:</strong></p>
            <ul>
              <li>Keep between 60-120 characters for best visibility</li>
              <li>Highlight key benefits or features</li>
              <li>Avoid repeating information already visible in the image</li>
              <li>Use clear calls to action directing to the buttons</li>
              <li>Use formatting: *bold*, _italic_, ~strikethrough~, `code`, ```code block```</li>
              <li>For lists use: * for bullets, 1. for numbered lists</li>
              <li>For quotes use: {'>'} at the beginning of the line</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Render buttons panel
  const renderButtonsPanel = () => (
    <div className={styles.buttonsSection}>
      {card.buttons.length > 0 ? (
        <div className={styles.buttonsList}>
          {card.buttons.map((button, buttonIndex) => (
            <div 
              key={buttonIndex} 
              className={`
                ${styles.buttonItem} 
                ${changedFields.includes('buttons') ? styles.changedField : ''}
              `}
            >
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
          <FiAlertCircle size={18} />
          No buttons added. Buttons are required for each card.
        </div>
      )}
      
      {card.buttons.length < 2 && (
        <button 
          onClick={addButton}
          className={styles.addButton}
        >
          <FiPlus size={16} />
          Add Button
        </button>
      )}
      
      {showHints && (
        <div className={styles.buttonHint}>
          <div className={styles.hintIconWrapper}>
            <FiInfo className={styles.hintIcon} />
          </div>
          <div>
            <p><strong>Button best practices:</strong></p>
            <ul>
              <li>Use clear, action-oriented text (e.g., "Buy Now", "Learn More")</li>
              <li>Keep button text under 20 characters</li>
              <li>Each card can have up to 2 buttons</li>
              <li>For URLs, always include the https:// prefix</li>
              <li>For phone numbers, use international format (+XXXXXXXXXXX)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Render collapsed card content for minimized view
  const renderCollapsedContent = () => (
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
  );

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
              <span className={styles.fileHandleLabel}>File ID:</span> 
              <div className={styles.fileHandleWrapper}>
                <span className={styles.fileHandleValue}>{card.fileHandle}</span>
                <button 
                  className={styles.copyButton}
                  onClick={copyFileHandle}
                  title="Copy file ID"
                  aria-label="Copy file ID"
                >
                  {copySuccess ? (
                    <>
                      <FiCheck className={styles.copyIcon} />
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
                  {showImagePreview ? 'Hide image' : 'View image'}
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
      
      {isExpanded ? (
        <div className={styles.cardContent}>
          <div className={styles.editorTabs}>
            <button 
              className={`${styles.editorTab} ${activeSection === 'text' ? styles.activeTab : ''}`}
              onClick={() => setActiveSection('text')}
            >
              <FiMessageSquare size={16} />
              Card Text
            </button>
            <button 
              className={`${styles.editorTab} ${activeSection === 'buttons' ? styles.activeTab : ''}`}
              onClick={() => setActiveSection('buttons')}
            >
              <FiLink size={16} />
              Buttons
              <span className={styles.buttonCount}>({card.buttons.length}/2)</span>
            </button>
          </div>
          
          {activeSection === 'text' && renderTextPanel()}
          {activeSection === 'buttons' && renderButtonsPanel()}
        </div>
      ) : renderCollapsedContent()}
    </div>
  );
};

export default CardTemplateEditor;