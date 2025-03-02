// components/editors/CardTemplateEditor.js
import React, { useState } from 'react';
import ButtonEditor from './ButtonEditor';
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
  
  // Character count for card body text
  const textLength = card.bodyText ? card.bodyText.length : 0;
  const isTextWarning = textLength > 120;
  const isTextValid = !!card.bodyText;
  
  // Usando updateCard em vez de manipular diretamente setCards
  const handleBodyTextChange = (e) => {
    updateCard(index, 'bodyText', e.target.value);
  };

  // Função para atualizar os botões
  const updateButtons = (newButtons) => {
    updateCard(index, 'buttons', newButtons);
  };

  // Adicionar um novo botão
  const addButton = () => {
    if (card.buttons.length < 2) {
      const newButtons = [...card.buttons, { type: 'QUICK_REPLY', text: '' }];
      updateButtons(newButtons);
    }
  };

  // Remover um botão
  const removeButton = (buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    updateButtons(newButtons);
  };

  // Atualizar um campo específico de um botão
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

  // Função para copiar o file handle para a área de transferência
  const copyFileHandle = () => {
    if (card.fileHandle) {
      navigator.clipboard.writeText(card.fileHandle)
        .then(() => {
          setCopySuccess(true);
          // Reset da mensagem de sucesso após 2 segundos
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Erro ao copiar:', err);
        });
    }
  };

  return (
    <div 
      id={id} 
      className={`${styles.cardContainer} ${validationMessage ? styles.invalidCard : ''}`}
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
                  title="Copiar File Handle"
                  aria-label="Copiar File Handle"
                >
                  {copySuccess ? (
                    <>
                      <svg className={styles.copyIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span className={styles.tooltipText}>Copiado!</span>
                    </>
                  ) : (
                    <svg className={styles.copyIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {card.fileType === 'image' && (
                <button 
                  className={styles.previewButton}
                  onClick={() => setShowImagePreview(!showImagePreview)}
                >
                  {showImagePreview ? 'Ocultar Imagem' : 'Ver Imagem'}
                </button>
              )}
            </div>
          )}
        </div>
        
        <button 
          className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Recolher card" : "Expandir card"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d={isExpanded ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" : "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"} />
          </svg>
        </button>
      </div>
      
      {validationMessage && (
        <div className={styles.validationMessage}>
          <svg className={styles.warningIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {validationMessage}
        </div>
      )}
      
      {showImagePreview && card.fileUrl && card.fileType === 'image' && (
        <div className={styles.imagePreviewContainer}>
          <img 
            src={card.fileUrl} 
            alt={`Preview do card ${index + 1}`} 
            className={styles.imagePreview}
          />
          <button 
            className={styles.closePreviewButton}
            onClick={() => setShowImagePreview(false)}
          >
            ✕
          </button>
        </div>
      )}
      
      {isExpanded && (
        <div className={styles.cardContent}>
          <div className={styles.cardFieldSection}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Texto do Card
              </h4>
              <span className={styles.characterBadge} style={{
                backgroundColor: isTextWarning ? 'var(--vis-vis)' : 'var(--select-bg)'
              }}>
                {textLength}/160
              </span>
            </div>
            
            <textarea 
              className={`${styles.textarea} ${!isTextValid && card.bodyText !== '' ? styles.invalidInput : ''}`}
              rows="3"
              value={card.bodyText}
              onChange={handleBodyTextChange}
              placeholder="Descrição do produto ou serviço que aparecerá neste card. Seja claro e objetivo."
              maxLength={160}
            ></textarea>
            
            {showHints && (
              <div className={styles.textHint}>
                <svg className={styles.lightbulbIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                </svg>
                <div>
                  <p><strong>Dicas para um bom texto:</strong></p>
                  <ul>
                    <li>Mantenha entre 60-120 caracteres para melhor visualização</li>
                    <li>Destaque os principais benefícios ou características</li>
                    <li>Evite repetir informações já presentes na imagem</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.buttonsSection}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                </svg>
                Botões do Card <span className={styles.buttonCount}>({card.buttons.length}/2)</span>
              </h4>
            </div>
            
            {card.buttons.map((button, buttonIndex) => (
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
            ))}
            
            {card.buttons.length < 2 && (
              <button 
                onClick={addButton}
                className={styles.addButton}
              >
                <svg className={styles.plusIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Adicionar Botão
              </button>
            )}
            
            {showHints && card.buttons.length === 0 && (
              <div className={styles.buttonHint}>
                Todo card precisa ter pelo menos um botão. Adicione um botão agora!
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isExpanded && (
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
        </div>
      )}
    </div>
  );
};

export default CardTemplateEditor;