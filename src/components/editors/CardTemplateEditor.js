// components/editors/CardTemplateEditor.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ButtonEditor from './ButtonEditor';
import { useAlert } from '../ui/AlertMessage/AlertContext'; // Adicionar esta importação
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
  FiInfo
} from 'react-icons/fi';
import styles from './CardTemplateEditor.module.css';
import Input from '../ui/Input/Input';
import Hints from '../ui/Hints/Hints'; // Import the Hints component

const CardTemplateEditor = ({ 
  id, 
  index, 
  card, 
  cards, 
  updateCard,
  showHints = true,
  validationMessage,
  numCards = 2
}) => {
  // Inicializar sistema de alertas
  const alert = useAlert();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('text');
  const [changedFields, setChangedFields] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (changedFields.length > 0) {
      const timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [changedFields]);

  const maxTextLength = 160;
  const isTextValid = !!card.bodyText;

  const handleBodyTextChange = useCallback((e) => {
    updateCard(index, 'bodyText', e.target.value);
    if (!changedFields.includes('bodyText')) {
      setChangedFields(prev => [...prev, 'bodyText']);
    }
  }, [updateCard, index, changedFields]);

  const updateButtons = useCallback((newButtons) => {
    updateCard(index, 'buttons', newButtons);
    if (!changedFields.includes('buttons')) {
      setChangedFields(prev => [...prev, 'buttons']);
    }
  }, [updateCard, index, changedFields]);

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
    }
  }, [index, cards, numCards, updateCard]);

  const addButton = useCallback(() => {
    if (card.buttons.length < 2) {
      const buttonType = card.buttons[0]?.type || 'QUICK_REPLY';
      const newButtons = [...card.buttons, { type: buttonType, text: '' }];
      updateButtons(newButtons);
      
      if (index === 0 && numCards > 1) {
        for (let cardIndex = 1; cardIndex < numCards; cardIndex++) {
          const cardButtons = [...cards[cardIndex].buttons];
          cardButtons.push({ type: buttonType, text: '' });
          updateCard(cardIndex, 'buttons', cardButtons);
        }
        
        // Alerta quando adicionar botão no primeiro card (sincronização)
        alert.info("Botão adicionado em todos os cards para manter a consistência exigida pelo WhatsApp.", {
          position: 'bottom-right',
          autoCloseTime: 4000
        });
      } else if (index > 0) {
        // Substituir o alert padrão pelo novo sistema de alertas
        alert.warning("Para manter a consistência do WhatsApp, adicionaremos este botão em todos os cards.", {
          position: 'top-center'
        });
        
        for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
          if (cardIndex !== index) {
            const cardButtons = [...cards[cardIndex].buttons];
            cardButtons.push({ type: buttonType, text: '' });
            updateCard(cardIndex, 'buttons', cardButtons);
          }
        }
      }
    } else {
      // Alerta quando tentar adicionar mais de 2 botões
      alert.warning("O WhatsApp permite no máximo 2 botões por card.", {
        position: 'top-center'
      });
    }
  }, [card.buttons, updateButtons, cards, updateCard, index, numCards, alert]);

  const removeButton = useCallback((buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    updateButtons(newButtons);
    
    if (numCards > 1) {
      // Alerta quando remover botão (sincronização)
      alert.warning("O botão será removido de todos os cards para manter a consistência exigida pelo WhatsApp.", {
        position: 'top-center',
        autoCloseTime: 3000
      });
      
      for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
        if (cardIndex !== index) {
          const cardButtons = cards[cardIndex].buttons.filter((_, i) => i !== buttonIndex);
          updateCard(cardIndex, 'buttons', cardButtons);
        }
      }
    }
  }, [card.buttons, updateButtons, cards, updateCard, index, numCards, alert]);

  const updateButtonField = useCallback((buttonIndex, field, value) => {
    const newButtons = [...card.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
    updateButtons(newButtons);
    if (field === 'type' && index === 0 && numCards > 1) {
      syncButtonTypes(buttonIndex, value);
      
      // Alerta quando mudar o tipo de botão no primeiro card (sincronização)
      alert.info(`Tipo de botão sincronizado em todos os cards: ${value}`, {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
    }
  }, [card.buttons, updateButtons, syncButtonTypes, index, numCards, alert]);

  const getCardColor = useCallback(() => {
    const colors = [
      'var(--blip-action)',
      'var(--mountain-meadow)',
      'var(--marigold-yellow)',
      'var(--chilean-fire)',
      'var(--windsor)',
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

  const copyFileHandle = useCallback(() => {
    if (card.fileHandle) {
      navigator.clipboard.writeText(card.fileHandle)
        .then(() => {
          setCopySuccess(true);
          
          // Alerta quando copiar o ID do arquivo
          alert.success("ID do arquivo copiado para a área de transferência!", {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
          
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Error copying:', err);
          
          // Alerta em caso de erro ao copiar
          alert.error("Não foi possível copiar o ID do arquivo", {
            position: 'bottom-right'
          });
        });
    } else {
      // Alerta quando não houver ID para copiar
      alert.warning("Este card não possui ID de arquivo para copiar", {
        position: 'bottom-right'
      });
    }
  }, [card.fileHandle, alert]);

  const renderTextPanel = () => (
    <div className={styles.cardFieldSection}>
      <Input
        id={`card-${index}-text`}
        name="cardText"
        label="Texto do card"
        ref={textareaRef}
        type="textarea"
        className={`
          ${!isTextValid && card.bodyText !== '' ? styles.invalidInput : ''} 
          ${changedFields.includes('bodyText') ? styles.changedField : ''}
        `}
        rows={4}
        value={card.bodyText || ''}
        onChange={handleBodyTextChange}
        placeholder="Descreva o produto ou serviço de forma clara e objetiva."
        maxLength={maxTextLength}
        allowFormatting={true}
        textFormatting={true}
        textFormattingCompact={true}
        textFormattingDarkMode={false}
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
        validateOnChange={true}
        validateOnBlur={true}
        error={!isTextValid && card.bodyText !== '' ? "O texto não atende aos requisitos mínimos." : ""}
      />
    </div>
  );

  const renderButtonsPanel = () => (
    <div className={styles.buttonsSection}>
      {index === 0 && numCards > 1 && (
        <div className={styles.whatsappRequirement}>
          <FiInfo size={16} className={styles.infoIcon} />
          <div>
            <strong>Requisito do WhatsApp:</strong> Todos os cards devem ter o mesmo número e tipos de botões.
            As alterações feitas no Card 1 serão sincronizadas automaticamente com os outros cards.
          </div>
        </div>
      )}
    
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
                cards={cards}
                numCards={numCards}
                syncButtonTypes={syncButtonTypes}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noButtonsMessage}>
          <FiAlertCircle size={18} />
          Nenhum botão adicionado. Cada card deve ter pelo menos um botão.
        </div>
      )}
      
      {card.buttons.length < 2 && (
        <button 
          onClick={addButton}
          className={styles.addButton}
        >
          <FiPlus size={16} />
          {numCards > 1 ? "Adicionar Botão a Todos os Cards" : "Adicionar Botão"}
        </button>
      )}
      
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

  const renderCollapsedContent = () => (
    <div className={styles.collapsedPreview}>
      <div className={styles.collapsedField}>
        <span className={styles.collapsedLabel}>Texto:</span>
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
                  {showImagePreview ? 'Esconder imagem' : 'Mostrar imagem'}
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
            aria-label={isExpanded ? "Minimizar" : "Expandir"}
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