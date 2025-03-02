// components/steps/StepTwo.js
import React, { useState } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import StatusMessage from '../common/StatusMessage';
import styles from './StepTwo.module.css';

const StepTwo = ({
  templateName,
  setTemplateName,
  language,
  setLanguage,
  bodyText,
  setBodyText,
  cards,
  numCards,
  updateCard,
  handleCreateTemplate,
  setStep,
  error,
  loading,
  isStepValid
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showHints, setShowHints] = useState(true);
  const [validationMessages, setValidationMessages] = useState({});

  // Check if required fields are filled
  const isTemplateNameValid = templateName.length >= 3;
  const isBodyTextValid = bodyText.length > 0;
  
  // Validate all cards have at least basic info
  const validateCards = () => {
    const messages = {};
    let allValid = true;
    
    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.bodyText) {
        messages[`card-${index}`] = `O texto do card ${index + 1} é obrigatório`;
        allValid = false;
      }
      
      if (card.buttons.some(button => !button.text)) {
        messages[`card-${index}-buttons`] = `Todos os botões do card ${index + 1} precisam ter texto`;
        allValid = false;
      }
      
      card.buttons.forEach((button, btnIndex) => {
        if (button.type === 'URL' && !button.url) {
          messages[`card-${index}-button-${btnIndex}`] = `URL é obrigatória para o botão ${btnIndex + 1}`;
          allValid = false;
        }
        if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
          messages[`card-${index}-button-${btnIndex}`] = `Número de telefone é obrigatório para o botão ${btnIndex + 1}`;
          allValid = false;
        }
      });
    });
    
    setValidationMessages(messages);
    return allValid;
  };
  
  const handleContinue = () => {
    if (validateCards()) {
      handleCreateTemplate();
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(validationMessages)[0];
      if (firstErrorKey) {
        const element = document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };
  
  const isAllValid = isTemplateNameValid && isBodyTextValid && Object.keys(validationMessages).length === 0;
  const completionPercentage = [
    isTemplateNameValid,
    isBodyTextValid,
    cards.slice(0, numCards).every(card => card.bodyText),
    cards.slice(0, numCards).every(card => card.buttons.every(button => button.text)),
  ].filter(Boolean).length * 25;
  
  // Languages with proper formatting
  const languageOptions = [
    { code: "pt_BR", name: "Português (Brasil)" },
    { code: "en_US", name: "English (United States)" },
    { code: "es_ES", name: "Español (España)" },
    { code: "fr_FR", name: "Français (France)" },
    { code: "it_IT", name: "Italiano (Italia)" },
    { code: "de_DE", name: "Deutsch (Deutschland)" },
    { code: "ja_JP", name: "日本語 (日本)" },
    { code: "ko_KR", name: "한국어 (대한민국)" },
    { code: "zh_CN", name: "中文 (中国)" },
    { code: "ar_SA", name: "العربية (المملكة العربية السعودية)" }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {completionPercentage === 100 ? 
            '✓ Todos os campos preenchidos!' : 
            `${completionPercentage}% preenchido`}
        </span>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.formContainer}>
          <div className={styles.container}>
            <header className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Passo 2: Criação do Template</h2>
              <button 
                className={styles.hintToggle}
                onClick={() => setShowHints(!showHints)}
                aria-label={showHints ? "Ocultar dicas" : "Mostrar dicas"}
              >
                {showHints ? "Ocultar dicas" : "Mostrar dicas"}
              </button>
            </header>
            
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'details' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('details')}
              >
                1. Detalhes Básicos
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'cards' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('cards')}
              >
                2. Conteúdo dos Cards
              </button>
            </div>
            
            {activeTab === 'details' && (
              <div className={styles.tabContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="templateName">
                    Nome do Template
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input 
                    id="templateName"
                    type="text" 
                    className={`${styles.input} ${!isTemplateNameValid && templateName ? styles.invalidInput : ''}`}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="meu_template_carousel"
                  />
                  {showHints && (
                    <div className={styles.hint}>
                      <svg className={styles.hintIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z"/>
                      </svg>
                      Use um nome descritivo sem espaços, mínimo de 3 caracteres. Exemplo: "promocao_verao" ou "lancamento_produto"
                    </div>
                  )}
                  {!isTemplateNameValid && templateName && (
                    <div className={styles.errorMessage}>
                      O nome do template deve ter pelo menos 3 caracteres
                    </div>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="language">
                    Idioma do Template
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <div className={styles.customSelect}>
                    <select 
                      id="language"
                      className={styles.select}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {languageOptions.map(option => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.selectArrow}></div>
                  </div>
                  {showHints && (
                    <div className={styles.hint}>
                      <svg className={styles.hintIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z"/>
                      </svg>
                      Escolha o idioma principal do template. Isso afetará a aprovação do template pelo WhatsApp.
                    </div>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="bodyText">
                    Texto do Corpo da Mensagem
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <textarea 
                    id="bodyText"
                    className={`${styles.textarea} ${!isBodyTextValid && bodyText !== '' ? styles.invalidInput : ''}`}
                    rows="4"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Este texto aparecerá antes do carrossel. Seja claro e objetivo para engajar seus clientes."
                    maxLength={1024}
                  ></textarea>
                  <div className={`${styles.characterCount} ${bodyText.length > 900 ? styles.almostFull : ''}`}>
                    {bodyText.length}/1024 caracteres
                    {bodyText.length > 900 && " - Chegando ao limite!"}
                  </div>
                  {showHints && (
                    <div className={styles.hint}>
                      <svg className={styles.hintIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z"/>
                      </svg>
                      Escreva de forma clara e objetiva. Este texto introduz seu carrossel e aparece acima dele na conversa.
                    </div>
                  )}
                  {!isBodyTextValid && bodyText !== '' && (
                    <div className={styles.errorMessage}>
                      O texto do corpo da mensagem é obrigatório
                    </div>
                  )}
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.nextTabButton}
                    onClick={() => setActiveTab('cards')}
                  >
                    Continuar para Conteúdo dos Cards
                    <svg className={styles.arrowIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'cards' && (
              <div className={styles.tabContent}>
                <div className={styles.cardsContainer}>
                  {cards.slice(0, numCards).map((card, index) => (
                    <CardTemplateEditor 
                      key={index} 
                      id={`card-${index}`}
                      index={index} 
                      card={card} 
                      cards={cards}
                      updateCard={updateCard}
                      showHints={showHints}
                      validationMessage={
                        validationMessages[`card-${index}`] || 
                        validationMessages[`card-${index}-buttons`]
                      }
                    />
                  ))}
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.prevTabButton}
                    onClick={() => setActiveTab('details')}
                  >
                    <svg className={styles.arrowIconLeft} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Voltar para Detalhes Básicos
                  </button>
                </div>
              </div>
            )}
            
            {/* Botões de navegação fixos na parte inferior */}
            <div className={styles.fixedButtonGroup}>
              <button 
                className={styles.backButton}
                onClick={() => setStep(1)}
              >
                <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Voltar
              </button>
              
              <button 
                className={styles.nextButton}
                onClick={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className={styles.loadingIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    Criar Template
                    <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            <StatusMessage error={error} success={null} />
          </div>
        </div>

        <div className={styles.previewContainer}>
          <div className={styles.previewWrapper}>
            <h3 className={styles.previewTitle}>Pré-visualização do Carrossel</h3>
            <div className={styles.previewContent}>
              <CarouselPreview 
                cards={cards.slice(0, numCards)} 
                bodyText={bodyText} 
              />
            </div>
            
            <div className={styles.previewHint}>
              Esta é uma visualização de como seu carrossel aparecerá no WhatsApp.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;