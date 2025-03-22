// components/editors/CardTemplateEditor.js - Enhanced Version
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ButtonEditor from './ButtonEditor';
import { useAlertService } from '../../hooks/common/useAlertService'; 
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
  FiCheckCircle,
  FiAlertTriangle,
  FiEdit,
  FiRefreshCw,
  FiZap,
  FiTrash2,
  FiCopy
} from 'react-icons/fi';
import styles from './CardTemplateEditor.module.css';
import Input from '../ui/Input/Input';
import Hints from '../ui/Hints/Hints'; 

/**
 * Enhanced CardTemplateEditor Component with improved UX and button synchronization
 */
const CardTemplateEditor = ({ 
  id, 
  index, 
  card, 
  cards, 
  updateCard,
  showHints = true,
  validationMessage,
  numCards = 2,
  setFocusedInput,
  focusedInput,
  missingFields = [],
  isComplete = false,
  syncButtonTypeForAllCards = null // NEW: Function to sync button types across all cards
}) => {
  // Initialize alert service
  const alert = useAlertService();
  
  // Local state for UI interactions
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('text');
  const [changedFields, setChangedFields] = useState([]);
  const [buttonSyncCompleted, setButtonSyncCompleted] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(false);
  
  // Refs
  const textareaRef = useRef(null);
  const cardRef = useRef(null);

  // Clear changed fields highlighting after timeout
  useEffect(() => {
    let timer;
    
    // Only create a new timer if fields have changed
    if (changedFields.length > 0) {
      timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [changedFields.length]);

  // Clear button sync notification after timeout
  useEffect(() => {
    if (buttonSyncCompleted) {
      const timer = setTimeout(() => {
        setButtonSyncCompleted(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [buttonSyncCompleted]);

  // Card text validation
  const maxTextLength = 160;
  const isTextValid = !!card.bodyText;

  // Check if a specific field is missing
  const isMissingField = (fieldName) => {
    return missingFields.some(field => field.includes(fieldName));
  };

  // Handle card text change with debouncing to prevent excessive re-renders
const handleBodyTextChange = useCallback((e) => {
  const newValue = e.target.value;
  
  // Use a simple debounce pattern to avoid triggering too many updates
  if (window._textChangeTimeout) {
    clearTimeout(window._textChangeTimeout);
  }
  
  window._textChangeTimeout = setTimeout(() => {
    updateCard(index, 'bodyText', newValue);
    
    if (!changedFields.includes('bodyText')) {
      setChangedFields(prev => [...prev, 'bodyText']);
    }
    
    window._textChangeTimeout = null;
  }, 150); // Small delay for typing
}, [updateCard, index, changedFields, setChangedFields]);

useEffect(() => {
  return () => {
    if (window._textChangeTimeout) {
      clearTimeout(window._textChangeTimeout);
      window._textChangeTimeout = null;
    }
  };
}, []);

  // Update all buttons at once
  const updateButtons = useCallback((newButtons) => {
    updateCard(index, 'buttons', newButtons);
    if (!changedFields.includes('buttons')) {
      setChangedFields(prev => [...prev, 'buttons']);
    }
  }, [updateCard, index, changedFields]);

  // Enhanced button type synchronization across all cards
  const syncButtonTypes = useCallback((buttonIndex, newType) => {
    if (index === 0 && numCards > 1) {
      for (let cardIndex = 1; cardIndex < numCards; cardIndex++) {
        const otherCard = cards[cardIndex];
        if (otherCard.buttons.length > buttonIndex) {
          const cardButtons = [...otherCard.buttons];
          const existingButton = cardButtons[buttonIndex];
          cardButtons[buttonIndex] = {
            ...existingButton,
            type: newType,
            ...(newType === 'URL' && !existingButton.url ? { url: '' } : {}),
            ...(newType === 'PHONE_NUMBER' && !existingButton.phoneNumber ? { phoneNumber: '' } : {}),
            ...(newType === 'QUICK_REPLY' && !existingButton.payload ? { payload: '' } : {})
          };
          updateCard(cardIndex, 'buttons', cardButtons);
        }
      }
      
      // Set sync completed flag to show notification
      setButtonSyncCompleted(true);
    }
  }, [index, cards, numCards, updateCard]);

  // Add button to card with enhanced synchronization
  const addButton = useCallback(() => {
    if (card.buttons.length < 2) {
      const buttonType = card.buttons[0]?.type || 'QUICK_REPLY';
      const newButtons = [...card.buttons, { type: buttonType, text: '' }];
      updateButtons(newButtons);
      
      if (numCards > 1) {
        // Ask for confirmation before syncing to all cards
        const message = index === 0 
          ? "Isso adicionará um botão em todos os cards. Deseja continuar?"
          : "O WhatsApp exige que todos os cards tenham o mesmo número e tipo de botões. Isso adicionará um botão em todos os cards. Deseja continuar?";
        
        if (window.confirm(message)) {
          for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
            if (cardIndex !== index) {
              const cardButtons = [...cards[cardIndex].buttons];
              cardButtons.push({ type: buttonType, text: '' });
              updateCard(cardIndex, 'buttons', cardButtons);
            }
          }
          
          // Show sync notification
          alert.info("Botão adicionado em todos os cards", {
            position: 'bottom-right',
            autoCloseTime: 4000
          });
          
          setButtonSyncCompleted(true);
        } else {
          // Undo button addition if user cancels
          updateButtons(card.buttons);
        }
      }
    } else {
      // Alert when trying to add more than 2 buttons
      alert.warning("Limite máximo de 2 botões por card atingido", {
        position: 'top-center'
      });
    }
  }, [card.buttons, updateButtons, cards, updateCard, index, numCards, alert]);

  // Remove button with enhanced synchronization
  const removeButton = useCallback((buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    
    if (numCards > 1) {
      // Ask for confirmation before syncing to all cards
      if (window.confirm("Isso removerá este botão de todos os cards. Deseja continuar?")) {
        updateButtons(newButtons);
        
        for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
          if (cardIndex !== index) {
            const cardButtons = cards[cardIndex].buttons.filter((_, i) => i !== buttonIndex);
            updateCard(cardIndex, 'buttons', cardButtons);
          }
        }
        
        // Show sync notification
        alert.warning("Botão removido em todos os cards", {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
        
        setButtonSyncCompleted(true);
      }
    } else {
      updateButtons(newButtons);
    }
  }, [card.buttons, updateButtons, cards, updateCard, index, numCards, alert]);

  // Update a specific button field
  const updateButtonField = useCallback((buttonIndex, field, value) => {
    const newButtons = [...card.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
    updateButtons(newButtons);
    
    if (field === 'type' && index === 0 && numCards > 1) {
      syncButtonTypes(buttonIndex, value);
    }
  }, [card.buttons, updateButtons, syncButtonTypes, index, numCards]);

  // Get a color for card styling based on index
  const getCardColor = useCallback(() => {
    const colors = [
      'var(--extended-ocean-light)',
      'var(--extended-ocean-dark)',
      'var(--extended-blue-light)',
      'var(--extended-blue-dark)',
      'var(--extended-green-light)',
      'var(--extended-green-dark)',
      'var(--extended-yellow-light)',
      'var(--extended-yellow-dark)',
      'var(--extended-orange-light)',
      'var(--extended-orange-dark)',
      'var(--extended-red-light)',
      'var(--extended-red-dark)',
      'var(--extended-pink-light)',
      'var(--extended-pink-dark)',
      'var(--extended-gray-light)',
      'rgba(30, 107, 241, 1)', // --color-surface-primary
      'rgba(1, 114, 62, 1)', // --color-surface-positive
      'rgba(138, 0, 0, 1)', // --color-surface-negative
      'rgba(30, 107, 241, 1)', // --color-primary
      'rgba(41, 41, 41, 1)', // --color-secondary
      'rgba(0, 122, 66, 1)', // --color-positive
      'rgba(138, 0, 0, 1)', // --color-negative
      'rgba(230, 15, 15, 1)', // --color-delete
      '#C5D9FB', // --blip-light
      '#0096fa', // --blip-blue-brand
      '#1968F0', // --blip-action
      '#0C4EC0', // --blip-dark
      '#072F73', // --blip-night
      'rgba(0, 150, 250, 1)', // --color-brand
    ];
    return colors[index % colors.length];
  }, [index]);

  // Copy file handle to clipboard
  const copyFileHandle = useCallback(() => {
    if (card.fileHandle) {
      navigator.clipboard.writeText(card.fileHandle)
        .then(() => {
          setCopySuccess(true);
          
          // Alert when file ID is copied
          alert.success("ID do arquivo copiado para a área de transferência!", {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
          
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Error copying:', err);
          
          // Alert when copy fails
          alert.error("Não foi possível copiar o ID do arquivo", {
            position: 'bottom-right'
          });
        });
    } else {
      // Alert when there's no file ID to copy
      alert.warning("Este card não possui ID de arquivo para copiar", {
        position: 'bottom-right'
      });
    }
  }, [card.fileHandle, alert]);

  // Scroll to this card when focused
  useEffect(() => {
    if (focusedInput && focusedInput.cardIndex === index) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedInput, index]);

  // Text editor panel
  const renderTextPanel = () => (
    <div className={styles.cardFieldSection}>
      {/* Banner for missing card text */}
      {isMissingField('texto do card') && (
        <div className={styles.missingFieldBanner}>
          <FiAlertTriangle size={18} />
          <span>É necessário preencher o texto do card</span>
        </div>
      )}
      
      <Input
        id={`card-${index}-text`}
        name="cardText"
        label="Texto do card"
        ref={textareaRef}
        type="textarea"
        className={`
          ${!isTextValid && card.bodyText !== '' ? styles.invalidInput : ''} 
          ${changedFields.includes('bodyText') ? styles.changedField : ''}
          ${isMissingField('texto do card') ? styles.missingFieldInput : ''}
        `}
        rows={4}
        value={card.bodyText || ''}
        onChange={handleBodyTextChange}
        placeholder="Descreva o produto ou serviço de forma clara e objetiva."
        maxLength={maxTextLength}
        allowFormatting={true}
        textFormatting={true}
        textFormattingCompact={true}
        showCharCounter
        characterCounterVariant="default"
        required
        hintMessage={showHints}
        hintVariant="simple"
        hintTitle="Dicas para um bom texto:"
        hintList={[
          "Mantenha entre 60-120 caracteres para melhor legibilidade.",
          "Foque nos principais benefícios ou diferenciais.",
          "Evite repetir informações que já estão na imagem.",
          "Use frases diretas e insira chamadas para ação.",
          "Use formatação para destaque: *negrito*, _itálico_, ~tachado~, `código`.",
          "Para listas: * para tópicos, 1. para numeração.",
          "Para citações, comece a linha com >."
        ]}
        // validateOnChange={true}
        // validateOnBlur={true}
        error={!isTextValid && card.bodyText !== '' ? "O texto não atende aos requisitos mínimos." : ""}
      />
    </div>
  );

  // Buttons editor panel
  const renderButtonsPanel = () => (
    <div className={styles.buttonsSection}>
      {/* Enhanced WhatsApp requirement hint for button sync */}
      <div className={styles.whatsappRequirementBanner}>
        <FiInfo size={16} />
        <div>
          <strong>Requisito do WhatsApp:</strong> Todos os cards devem ter o mesmo número e tipos de botões.
          <span className={styles.syncNote}>
            {index === 0 ? 
              "Alterações neste card serão sincronizadas automaticamente com os outros." : 
              "O tipo dos botões pode ser alterado a partir do Card 1."
            }
          </span>
        </div>
      </div>
    
      {/* Button sync completed notification */}
      {buttonSyncCompleted && (
        <div className={styles.syncCompletedBanner}>
          <FiCheckCircle size={16} />
          <span>Alterações sincronizadas em todos os cards!</span>
        </div>
      )}
    
      {card.buttons.length > 0 ? (
        <div className={styles.buttonsList}>
          {/* Missing buttons banner */}
          {card.buttons.some((_, idx) => 
            isMissingField(`texto do botão ${idx + 1}`) || 
            isMissingField(`URL do botão ${idx + 1}`) || 
            isMissingField(`telefone do botão ${idx + 1}`)
          ) && (
            <div className={styles.missingButtonsBanner}>
              <FiAlertTriangle size={18} />
              <span>Um ou mais botões precisam ser preenchidos completamente</span>
            </div>
          )}
          
          {card.buttons.map((button, buttonIndex) => {
            // Check if this button has missing fields
            const buttonMissing = 
              isMissingField(`texto do botão ${buttonIndex + 1}`) || 
              isMissingField(`URL do botão ${buttonIndex + 1}`) || 
              isMissingField(`telefone do botão ${buttonIndex + 1}`);
              
            return (
              <div 
                key={buttonIndex} 
                className={`
                  ${styles.buttonItem} 
                  ${changedFields.includes('buttons') ? styles.changedField : ''}
                  ${buttonMissing ? styles.missingButtonItem : ''}
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
                  cards={cards}
                  numCards={numCards}
                  syncButtonTypes={syncButtonTypes}
                  setFocusedInput={setFocusedInput}
                  // Information about missing fields
                  missingText={isMissingField(`texto do botão ${buttonIndex + 1}`)}
                  missingUrl={button.type === 'URL' && isMissingField(`URL do botão ${buttonIndex + 1}`)}
                  missingPhone={button.type === 'PHONE_NUMBER' && isMissingField(`telefone do botão ${buttonIndex + 1}`)}
                  // NEW: Pass the global button sync function
                  syncButtonTypeForAllCards={syncButtonTypeForAllCards}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noButtonsMessage}>
          <FiAlertCircle size={18} />
          Nenhum botão adicionado. Cada card deve ter pelo menos um botão.
        </div>
      )}
      
      {/* Add button control */}
      {card.buttons.length < 2 && (
        <button 
          onClick={addButton}
          className={styles.addButton}
        >
          <FiPlus size={16} />
          {numCards > 1 ? "Adicionar Botão a Todos os Cards" : "Adicionar Botão"}
        </button>
      )}
      
      {/* Button best practices guide */}
      {showHints && (
        <Hints
          variant="simple"
          title="Melhores Práticas para Botões:"
          list={[
            "Use um texto claro e orientado para ação (ex.: 'Compre Agora', 'Saiba Mais')",
            "Mantenha o texto do botão com menos de 20 caracteres",
            "Cada card pode ter até 2 botões",
            "Para URLs, sempre inclua o prefixo https://",
            "Para números de telefone, use o formato internacional (+XXXXXXXXXXX)",
            "Requisito do WhatsApp: Todos os cards devem ter os mesmos tipos de botões na mesma ordem"
          ]}
        />
      )}
    </div>
  );

  // Card collapsed content preview
  const renderCollapsedContent = () => (
    <div className={styles.collapsedPreview}>
      <div className={styles.collapsedField}>
        <span className={styles.collapsedLabel}>Texto:</span>
        <span className={styles.collapsedValue}>
          {card.bodyText ? 
            (card.bodyText.length > 40 ? card.bodyText.substring(0, 40) + '...' : card.bodyText) : 
            <em className={styles.emptyText}>Não definido</em>}
        </span>
      </div>
      <div className={styles.collapsedField}>
        <span className={styles.collapsedLabel}>Botões:</span>
        <span className={styles.collapsedValue}>
          {card.buttons.length > 0 ? 
            card.buttons.map(b => b.text || 'Sem texto').join(', ') : 
            <em className={styles.emptyText}>Sem botões</em>}
        </span>
      </div>
      
      {/* Missing fields indicator when collapsed */}
      {missingFields.length > 0 && (
        <div className={styles.collapsedMissingFields}>
          <FiAlertTriangle size={14} />
          <span>{missingFields.length} campo(s) obrigatório(s) faltando</span>
        </div>
      )}
      
      {/* Validation message when collapsed */}
      {validationMessage && (
        <div className={styles.collapsedValidation}>
          <FiAlertCircle size={14} className={styles.validationIcon} />
          <span className={styles.validationText}>{validationMessage}</span>
        </div>
      )}
    </div>
  );

  // Card actions menu (more options)
  const renderCardActions = () => (
    <div className={`${styles.cardActionsMenu} ${actionsExpanded ? styles.expanded : ''}`}> 
      
      {actionsExpanded && (
        <div className={styles.actionsList}>
          {card.fileHandle && (
            <button 
              className={styles.actionButton} 
              onClick={copyFileHandle}
              title="Copiar ID do arquivo"
            >
              <FiCopy size={14} />
              <span>Copiar ID</span>
            </button>
          )}
          
          {card.fileType === 'image' && (
            <button 
              className={styles.actionButton}
              onClick={() => setShowImagePreview(!showImagePreview)}
              title={showImagePreview ? "Ocultar imagem" : "Mostrar imagem"}
            >
              {showImagePreview ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              <span>{showImagePreview ? 'Ocultar imagem' : 'Mostrar imagem'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div 
      id={id} 
      ref={cardRef}
      className={`
        ${styles.cardContainer} 
        ${validationMessage ? styles.invalidCard : ''} 
        ${isExpanded ? '' : styles.collapsedCard}
        ${isComplete ? styles.completeCard : styles.incompleteCard}
      `}
      style={{ borderLeftColor: getCardColor() }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleSection}>
          <h3 className={styles.cardTitle}>
            Card {index + 1}
            <span className={styles.cardIndicator} style={{ backgroundColor: getCardColor() }}></span>
            
            {/* Card status indicator */}
            {isComplete ? (
              <span className={styles.cardStatus}>
                <FiCheckCircle size={16} className={styles.completeIcon} />
                <span className={styles.statusText}>Completo</span>
              </span>
            ) : (
              <span className={styles.cardStatus}>
                <FiAlertTriangle size={16} className={styles.incompleteIcon} />
                <span className={styles.statusText}>
                  Faltando: {missingFields.length} {missingFields.length === 1 ? 'campo' : 'campos'}
                </span>
              </span>
            )}
          </h3>
          
          {/* File handle information */}
          {card.fileHandle && (
            <div className={styles.fileHandleInfo}>
              <span className={styles.fileHandleLabel}>File ID:</span> 
              <div className={styles.fileHandleWrapper}>
                <span className={styles.fileHandleValue}>{card.fileHandle}</span>
                <button 
                  className={styles.copyButton}
                  onClick={copyFileHandle}
                  title="Copiar ID do arquivo"
                  aria-label="Copiar ID do arquivo"
                >
                  {copySuccess ? (
                    <>
                      <FiCheck className={styles.copyIcon} />
                      <span className={styles.tooltipText}>Copiado!</span>
                    </>
                  ) : (
                    <FiLink className={styles.copyIcon} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.cardHeaderActions}>
          {/* Enhanced header actions */}
          {renderCardActions()}
          
          {/* Card status badges */}
          {!isComplete && (
            <div className={styles.cardActionBadge} title={`Faltando: ${missingFields.join(', ')}`}>
              <FiAlertTriangle size={16} className={styles.incompleteIcon} />
              <span className={styles.actionBadgeCount}>{missingFields.length}</span>
            </div>
          )}
          
          {validationMessage && (
            <div className={styles.validationBadge} title={validationMessage}>
              <FiAlertCircle size={16} />
            </div>
          )}
          
          {/* Expand/collapse button */}
          <button 
            className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Minimizar" : "Expandir"}
            title={isExpanded ? "Minimizar card" : "Expandir card"}
          >
            {isExpanded ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
          </button>
        </div>
      </div>
      
      {/* Missing fields summary */}
      {!isComplete && (
        <div className={styles.cardCompletionBar}>
          <div className={styles.missingFieldsDetail}>
            <FiAlertTriangle size={14} className={styles.incompleteIcon} />
            <span className={styles.missingFieldsLabel}>
              Pendente: {missingFields.join(', ')}
            </span>
          </div>
        </div>
      )}
      
      {/* Validation message */}
      {validationMessage && (
        <div className={styles.validationMessage}>
          <FiAlertCircle className={styles.warningIcon} />
          {validationMessage}
        </div>
      )}
      
      {/* Image preview */}
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
            aria-label="Fechar prévia"
            title="Fechar prévia"
          >
            ✕
          </button>
        </div>
      )}
      
      {isExpanded ? (
        <div className={styles.cardContent}>
          {/* Enhanced editor tabs */}
          <div className={styles.editorTabs}>
            <button 
              className={`
                ${styles.editorTab} 
                ${activeSection === 'text' ? styles.activeTab : ''} 
                ${isMissingField('texto do card') ? styles.missingFieldTab : ''}
              `}
              onClick={() => setActiveSection('text')}
            >
              <FiMessageSquare size={16} />
              Texto do Card
              {isMissingField('texto do card') && (
                <span className={styles.missingFieldIndicator}>*</span>
              )}
            </button>
            <button 
              className={`
                ${styles.editorTab} 
                ${activeSection === 'buttons' ? styles.activeTab : ''} 
                ${card.buttons.some((_, idx) => 
                  isMissingField(`texto do botão ${idx + 1}`) || 
                  isMissingField(`URL do botão ${idx + 1}`) || 
                  isMissingField(`telefone do botão ${idx + 1}`)
                ) ? styles.missingFieldTab : ''}
              `}
              onClick={() => setActiveSection('buttons')}
            >
              <FiLink size={16} />
              Botões
              <span className={styles.buttonCount}>({card.buttons.length}/2)</span>
              {card.buttons.some((_, idx) => 
                isMissingField(`texto do botão ${idx + 1}`) || 
                isMissingField(`URL do botão ${idx + 1}`) || 
                isMissingField(`telefone do botão ${idx + 1}`)
              ) && (
                <span className={styles.missingFieldIndicator}>*</span>
              )}
            </button>
          </div>
          
          {/* Render appropriate section */}
          <div className={styles.editorContent}>
            {activeSection === 'text' && renderTextPanel()}
            {activeSection === 'buttons' && renderButtonsPanel()}
          </div>
        </div>
      ) : renderCollapsedContent()}
    </div>
  );
};

export default CardTemplateEditor;