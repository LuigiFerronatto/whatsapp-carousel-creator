// components/editors/ButtonEditor.js
import React, { useState } from 'react';
import styles from './ButtonEditor.module.css';

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
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showPhoneHelp, setShowPhoneHelp] = useState(false);
  
  // Validate fields
  const isTextValid = !!button.text;
  const isUrlValid = button.type !== 'URL' || !!button.url;
  const isPhoneValid = button.type !== 'PHONE_NUMBER' || !!button.phoneNumber;
  
  // Character count for button text
  const textLength = button.text ? button.text.length : 0;
  const isTextWarning = textLength > 15;
  
  // Phone number formatting helper
  const formatPhoneNumber = (value) => {
    // Remove non-numeric characters except for +
    let cleaned = value.replace(/[^\d+]/g, '');
    // Ensure + is only at the beginning
    if (cleaned.indexOf('+') > 0) {
      cleaned = cleaned.replace(/\+/g, '');
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };
  
  // URL validation check
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Button type options with icons
  const buttonTypes = [
    { 
      value: 'URL', 
      label: 'Link URL', 
      icon: (
        <svg className={styles.typeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M18 10.82a1 1 0 0 0-1 1V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4.18a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4.18a1 1 0 0 0-1-1z"/>
          <path d="M21.92 2.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59l-7.3 7.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38z"/>
        </svg>
      ),
      description: 'Abre o link em um navegador externo quando clicado'
    },
    { 
      value: 'QUICK_REPLY', 
      label: 'Resposta Rápida', 
      icon: (
        <svg className={styles.typeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h10v2H7z"/>
          <path d="M7 12h5v2H7z"/>
        </svg>
      ),
      description: 'Envia uma resposta pré-definida quando clicado'
    },
    { 
      value: 'PHONE_NUMBER', 
      label: 'Telefone', 
      icon: (
        <svg className={styles.typeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
        </svg>
      ),
      description: 'Inicia uma chamada telefônica quando clicado'
    }
  ];

  return (
    <div className={`${styles.buttonContainer} ${validationMessage ? styles.invalidContainer : ''}`}>
      <div className={styles.buttonHeader}>
        <div className={styles.buttonTitleWrapper}>
          <span className={styles.buttonTitle}>
            Botão {buttonIndex + 1}
          </span>
          <div className={styles.buttonTypeBadge}>
            {buttonTypes.find(t => t.value === button.type)?.icon}
            <span>{buttonTypes.find(t => t.value === button.type)?.label}</span>
          </div>
        </div>
        {totalButtons > 1 && (
          <button 
            onClick={removeButton}
            className={styles.removeButton}
            aria-label="Remover botão"
          >
            <svg className={styles.trashIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/>
            </svg>
            Remover
          </button>
        )}
      </div>
      
      {validationMessage && (
        <div className={styles.validationMessage}>
          {validationMessage}
        </div>
      )}
      
      <div className={styles.buttonTypeSelector}>
        {buttonTypes.map(type => (
          <div 
            key={type.value}
            className={`${styles.typeOption} ${button.type === type.value ? styles.selectedType : ''}`}
            onClick={() => updateButtonField(buttonIndex, 'type', type.value)}
          >
            {type.icon}
            <span className={styles.typeLabel}>{type.label}</span>
          </div>
        ))}
      </div>
      
      {showHints && (
        <div className={styles.typeDescription}>
          {buttonTypes.find(t => t.value === button.type)?.description}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Texto do Botão
          <span className={styles.requiredMark}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input 
            type="text"
            className={`${styles.input} ${!isTextValid && button.text !== '' ? styles.invalidInput : ''}`}
            value={button.text}
            onChange={(e) => updateButtonField(buttonIndex, 'text', e.target.value)}
            placeholder="Exemplo: Saiba Mais, Comprar Agora, etc."
            maxLength={25}
          />
          <span className={`${styles.charCount} ${isTextWarning ? styles.warningCount : ''}`}>
            {textLength}/25
          </span>
        </div>
        {showHints && (
          <div className={styles.fieldHint}>
            <svg className={styles.infoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            Mantenha o texto curto e claro. Botões com 1-2 palavras têm melhor aparência.
          </div>
        )}
      </div>
      
      {button.type === 'URL' && (
        <div className={styles.formGroup}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>
              URL de Destino
              <span className={styles.requiredMark}>*</span>
            </label>
            <button 
              type="button" 
              className={styles.helpButton}
              onClick={() => setShowUrlHelp(!showUrlHelp)}
            >
              {showUrlHelp ? "Ocultar Ajuda" : "Ver Ajuda"}
            </button>
          </div>
          <input 
            type="url"
            className={`${styles.input} ${!isUrlValid && button.url !== '' ? styles.invalidInput : ''}`}
            value={button.url || ''}
            onChange={(e) => updateButtonField(buttonIndex, 'url', e.target.value)}
            placeholder="https://www.exemplo.com.br/pagina"
          />
          {button.url && !isValidUrl(button.url) && (
            <div className={styles.urlWarning}>
              URL inválida. Certifique-se de incluir "https://" ou "http://"
            </div>
          )}
          {showUrlHelp && (
            <div className={styles.helpContent}>
              <h4>Como criar um bom link:</h4>
              <ul>
                <li>Use sempre HTTPS quando possível (mais seguro)</li>
                <li>URL completa deve incluir "https://" no início</li>
                <li>Evite encurtadores de URL não confiáveis</li>
                <li>Teste o link antes de salvar</li>
              </ul>
              <div className={styles.exampleBox}>
                <strong>Exemplos válidos:</strong>
                <code>https://www.exemplo.com.br</code>
                <code>https://exemplo.com.br/produto?id=123</code>
              </div>
            </div>
          )}
        </div>
      )}
      
      {button.type === 'QUICK_REPLY' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Payload (opcional)
            <span className={styles.optionalBadge}>Opcional</span>
          </label>
          <input 
            type="text"
            className={styles.input}
            value={button.payload || ''}
            onChange={(e) => updateButtonField(buttonIndex, 'payload', e.target.value)}
            placeholder="Deixe vazio para usar o texto do botão"
          />
          {showHints && (
            <div className={styles.fieldHint}>
              <svg className={styles.infoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              O payload é o texto que será enviado para seu sistema quando o usuário clicar no botão.
            </div>
          )}
        </div>
      )}
      
      {button.type === 'PHONE_NUMBER' && (
        <div className={styles.formGroup}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>
              Número de Telefone
              <span className={styles.requiredMark}>*</span>
            </label>
            <button 
              type="button" 
              className={styles.helpButton}
              onClick={() => setShowPhoneHelp(!showPhoneHelp)}
            >
              {showPhoneHelp ? "Ocultar Ajuda" : "Ver Ajuda"}
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
          </div>
          {showPhoneHelp && (
            <div className={styles.helpContent}>
              <h4>Formato do número de telefone:</h4>
              <ul>
                <li>Use o formato internacional com "+" no início</li>
                <li>Inclua o código do país (Brasil: 55)</li>
                <li>Inclua o DDD sem o zero</li>
                <li>Não use espaços, parênteses ou hífens</li>
              </ul>
              <div className={styles.exampleBox}>
                <strong>Exemplos válidos:</strong>
                <code>+5521999999999</code>
                <code>+551140042222</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ButtonEditor;