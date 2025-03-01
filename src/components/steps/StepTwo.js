// components/steps/StepTwo.js
import React from 'react';
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
  updateCard, // Usar updateCard em vez de setCards
  handleCreateTemplate,
  setStep,
  error,
  loading
}) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.formContainer}>
          <div className={styles.container}>
            <h2 className={styles.stepTitle}>Passo 2: Criação do Template</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome do Template</label>
              <input 
                type="text" 
                className={styles.input}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="meu_template_carousel"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Idioma</label>
              <select 
                className={styles.select}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="pt_BR">Português (Brasil)</option>
                <option value="en_US">Inglês (EUA)</option>
                <option value="es_ES">Espanhol (Espanha)</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Texto do Corpo da Mensagem</label>
              <textarea 
                className={styles.textarea}
                rows="3"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Texto que aparecerá no topo do carrossel (máximo 1024 caracteres)"
                maxLength={1024}
              ></textarea>
              <div className={styles.characterCount}>{bodyText.length}/1024 caracteres</div>
            </div>
            
            {cards.slice(0, numCards).map((card, index) => (
              <CardTemplateEditor 
                key={index} 
                index={index} 
                card={card} 
                cards={cards}
                updateCard={updateCard}  // Passando updateCard em vez de setCards
              />
            ))}
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.backButton}
                onClick={() => setStep(1)}
              >
                Voltar
              </button>
              <div className={styles.buttonSpace}></div>
              <button 
                className={styles.nextButton}
                onClick={handleCreateTemplate}
                disabled={loading}
              >
                {loading && (
                  <svg className={styles.loadingIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Processando...' : 'Criar Template'}
              </button>
            </div>
            
            <StatusMessage error={error} success={null} />
          </div>
        </div>

        <div className={styles.previewContainer}>
          <h3 className={styles.previewTitle}>Pré-visualização do Carrossel</h3>
          <CarouselPreview 
            cards={cards.slice(0, numCards)} 
            bodyText={bodyText} 
          />
        </div>
      </div>
    </div>
  );
};

export default StepTwo;