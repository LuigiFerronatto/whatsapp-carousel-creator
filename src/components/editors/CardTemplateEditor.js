// components/editors/CardTemplateEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import ButtonEditor from './ButtonEditor';
import { FiMaximize2, FiMinimize2, FiEye, FiEyeOff, FiAlertCircle, FiLink, FiCheck } from 'react-icons/fi';
import styles from './CardTemplateEditor.module.css';

/**
 * Editor de Template de Card do WhatsApp
 * Componente refatorado para maior modularidade e facilidade de uso
 * 
 * @param {Object} props Propriedades do componente
 * @param {string} props.id ID único do card
 * @param {number} props.index Índice do card no array
 * @param {Object} props.card Dados do card
 * @param {Array} props.cards Array com todos os cards
 * @param {Function} props.updateCard Função para atualizar um card
 * @param {boolean} props.showHints Mostrar dicas de ajuda
 * @param {string} props.validationMessage Mensagem de validação (se houver)
 * @returns {JSX.Element} Componente de editor de card
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
  // Estados locais
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('text');
  const [changedFields, setChangedFields] = useState([]);
  
  // Limpar campos alterados depois de um tempo
  useEffect(() => {
    if (changedFields.length > 0) {
      const timer = setTimeout(() => {
        setChangedFields([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [changedFields]);
  
  // Validações básicas
  const textLength = card.bodyText ? card.bodyText.length : 0;
  const maxTextLength = 160;
  const textPercentage = Math.min((textLength / maxTextLength) * 100, 100);
  const isTextWarning = textLength > 120;
  const isTextDanger = textLength > 150;
  const isTextValid = !!card.bodyText;
  
  // Atualizar o texto do card com rastreamento de alterações
  const handleBodyTextChange = useCallback((e) => {
    updateCard(index, 'bodyText', e.target.value);
    if (!changedFields.includes('bodyText')) {
      setChangedFields(prev => [...prev, 'bodyText']);
    }
  }, [updateCard, index, changedFields]);

  // Atualizar botões do card
  const updateButtons = useCallback((newButtons) => {
    updateCard(index, 'buttons', newButtons);
    if (!changedFields.includes('buttons')) {
      setChangedFields(prev => [...prev, 'buttons']);
    }
  }, [updateCard, index, changedFields]);

  // Adicionar um novo botão
  const addButton = useCallback(() => {
    if (card.buttons.length < 2) {
      const newButtons = [...card.buttons, { type: 'QUICK_REPLY', text: '' }];
      updateButtons(newButtons);
    }
  }, [card.buttons, updateButtons]);

  // Remover um botão
  const removeButton = useCallback((buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    updateButtons(newButtons);
  }, [card.buttons, updateButtons]);

  // Atualizar um campo específico de um botão
  const updateButtonField = useCallback((buttonIndex, field, value) => {
    const newButtons = [...card.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
    updateButtons(newButtons);
  }, [card.buttons, updateButtons]);

  // Gerar cor com base no índice
  const getCardColor = useCallback(() => {
    const colors = [
      'var(--blip-light)',
      'var(--magic-mint)',
      'var(--marigold-yellow)',
      'var(--romantic)',
      'var(--perfume)'
    ];
    return colors[index % colors.length];
  }, [index]);

  // Copiar o identificador do arquivo para a área de transferência
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

  // Renderizar painel de texto do card
  const renderTextPanel = () => (
    <div className={styles.cardFieldSection}>
      <div className={styles.fieldHeader}>
        <label className={styles.fieldLabel} htmlFor={`card-${index}-text`}>
          Texto do Card
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
      
      <textarea 
        id={`card-${index}-text`}
        className={`
          ${styles.textarea} 
          ${!isTextValid && card.bodyText !== '' ? styles.invalidInput : ''} 
          ${changedFields.includes('bodyText') ? styles.changedField : ''}
        `}
        rows="3"
        value={card.bodyText}
        onChange={handleBodyTextChange}
        placeholder="Descrição do produto ou serviço que aparecerá neste card. Seja claro e conciso."
        maxLength={maxTextLength}
      ></textarea>
      
      {showHints && (
        <div className={styles.textHint}>
          <div className={styles.hintIconWrapper}>
            <FiAlertCircle className={styles.hintIcon} />
          </div>
          <div>
            <p><strong>Dicas para um bom texto de card:</strong></p>
            <ul>
              <li>Mantenha entre 60-120 caracteres para melhor visibilidade</li>
              <li>Destaque benefícios ou características principais</li>
              <li>Evite repetir informações já presentes na imagem</li>
              <li>Use chamadas claras para ação direcionando para os botões</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar painel de botões do card
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
          Nenhum botão adicionado. Botões são obrigatórios para cada card.
        </div>
      )}
      
      {card.buttons.length < 2 && (
        <button 
          onClick={addButton}
          className={styles.addButton}
        >
          + Adicionar Botão
        </button>
      )}
      
      {showHints && (
        <div className={styles.buttonHint}>
          <div className={styles.hintIconWrapper}>
            <FiAlertCircle className={styles.hintIcon} />
          </div>
          <div>
            <p><strong>Boas práticas para botões:</strong></p>
            <ul>
              <li>Use texto claro e orientado à ação (ex: "Comprar Agora", "Saber Mais")</li>
              <li>Mantenha o texto do botão com menos de 20 caracteres</li>
              <li>Cada card pode ter até 2 botões</li>
              <li>Para URLs, sempre inclua o prefixo https://</li>
              <li>Para números de telefone, use o formato internacional (+XXXXXXXXXXX)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar conteúdo reduzido quando o card estiver colapsado
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
            <em className={styles.emptyText}>Nenhum botão</em>}
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
              <span className={styles.fileHandleLabel}>ID do Arquivo:</span> 
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
              
              {card.fileType === 'image' && (
                <button 
                  className={styles.previewButton}
                  onClick={() => setShowImagePreview(!showImagePreview)}
                >
                  {showImagePreview ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  {showImagePreview ? 'Ocultar imagem' : 'Ver imagem'}
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
            aria-label={isExpanded ? "Recolher card" : "Expandir card"}
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
            alt={`Prévia do card ${index + 1}`} 
            className={styles.imagePreview}
          />
          <button 
            className={styles.closePreviewButton}
            onClick={() => setShowImagePreview(false)}
            aria-label="Fechar prévia"
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
              Texto do Card
            </button>
            <button 
              className={`${styles.editorTab} ${activeSection === 'buttons' ? styles.activeTab : ''}`}
              onClick={() => setActiveSection('buttons')}
            >
              Botões
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