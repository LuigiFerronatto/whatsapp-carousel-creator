// components/steps/StepTwo.js
import React, { useState, useEffect } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import AlertMessage from '../common/AlertMessage';
import { FiSave, FiCheck, FiChevronRight, FiChevronLeft, FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';
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
  isStepValid,
  saveDraftManually
}) => {
  const [showHints, setShowHints] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [validationMessages, setValidationMessages] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  // Reset validation messages when fields change
  useEffect(() => {
    if (templateName) {
      setValidationMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages.templateName;
        return newMessages;
      });
    }
    
    if (bodyText) {
      setValidationMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages.bodyText;
        return newMessages;
      });
    }
  }, [templateName, bodyText]);

  // Check if required fields are filled
  const isTemplateNameValid = templateName.length >= 3;
  const isBodyTextValid = bodyText.length > 0;
  
  // Validate all cards have at least basic info
  const validateCards = () => {
    const messages = {};
    let allValid = true;
    
    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.bodyText) {
        messages[`card-${index}`] = `Card ${index + 1} text is required`;
        allValid = false;
      }
      
      if (card.buttons.some(button => !button.text)) {
        messages[`card-${index}-buttons`] = `All buttons in card ${index + 1} must have text`;
        allValid = false;
      }
      
      card.buttons.forEach((button, btnIndex) => {
        if (button.type === 'URL' && !button.url) {
          messages[`card-${index}-button-${btnIndex}`] = `URL is required for button ${btnIndex + 1}`;
          allValid = false;
        }
        if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
          messages[`card-${index}-button-${btnIndex}`] = `Phone number is required for button ${btnIndex + 1}`;
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
    }
  };
  
  const handleSaveDraft = () => {
    saveDraftManually();
    setJustSaved(true);
    
    // Reset saved flag after 3 seconds
    setTimeout(() => {
      setJustSaved(false);
    }, 3000);
  };

  const navigateToCard = (direction) => {
    if (direction === 'next' && activeCard < numCards - 1) {
      setActiveCard(activeCard + 1);
    } else if (direction === 'prev' && activeCard > 0) {
      setActiveCard(activeCard - 1);
    }
  };
  
  const isAllValid = isTemplateNameValid && isBodyTextValid && Object.keys(validationMessages).length === 0;
  
  // Calculate completion percentage
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
      <div className={styles.headerContainer}>

        <h2 className={styles.stepTitle}>Step 2: Template Creation</h2>
        <p className={styles.stepDescription}>
          Configure your template details, including name, language, and content for each card.
        </p>


        <div className={styles.viewControls}>
          <button 
            className={styles.viewToggle}
            onClick={() => setShowPreview(!showPreview)}
            aria-label={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          
          <button 
            className={styles.hintsToggle}
            onClick={() => setShowHints(!showHints)}
            aria-label={showHints ? "Hide hints" : "Show hints"}
          >
            <FiInfo size={16} />
            {showHints ? "Hide hints" : "Show hints"}
          </button>
        </div>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={`${styles.formContainer} ${showPreview ? styles.withPreview : ''}`}>
          <div className={styles.basicDetailsSection}>

            <h3 className={styles.sectionTitle}>Basic Template Information</h3>
            

            <div className={styles.progressContainer}>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            
            <span className={styles.progressText}>
              {completionPercentage === 100 ? 
                '✓ All fields completed!' : 
                `${completionPercentage}% completed`}
            </span>
          </div>
        </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="templateName">
                Template Name
                <span className={styles.requiredMark}>*</span>
              </label>
              <input 
                id="templateName"
                type="text" 
                className={`${styles.input} ${!isTemplateNameValid && templateName ? styles.invalidInput : ''}`}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="my_carousel_template"
              />
              {showHints && (
                <div className={styles.hint}>
                  <FiInfo className={styles.hintIcon} />
                  Use a descriptive name without spaces, minimum 3 characters. Example: "summer_promo" or "product_launch"
                </div>
              )}
              {!isTemplateNameValid && templateName && (
                <div className={styles.errorMessage}>
                  Template name must be at least 3 characters
                </div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="language">
                Template Language
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
                  <FiInfo className={styles.hintIcon} />
                  Choose the main language for your template. This will affect approval by WhatsApp.
                </div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="bodyText">
                Message Body Text
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea 
                id="bodyText"
                className={`${styles.textarea} ${!isBodyTextValid && bodyText !== '' ? styles.invalidInput : ''}`}
                rows="3"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="This text will appear before the carousel. Be clear and engaging for your customers."
                maxLength={1024}
              ></textarea>
              <div className={`${styles.characterCount} ${bodyText.length > 900 ? styles.almostFull : ''}`}>
                {bodyText.length}/1024 characters
                {bodyText.length > 900 && " - Approaching limit!"}
              </div>
              {showHints && (
                <div className={styles.hint}>
                  <FiInfo className={styles.hintIcon} />
                  Write clearly and concisely. This text introduces your carousel and appears above it in the conversation.
                </div>
              )}
              {!isBodyTextValid && bodyText !== '' && (
                <div className={styles.errorMessage}>
                  Message body text is required
                </div>
              )}
            </div>
          </div>

          <div className={styles.cardEditorSection}>
            <div className={styles.cardNavigation}>
              <h3 className={styles.sectionTitle}>Card Content</h3>
              
              <div className={styles.cardTabs}>
                {cards.slice(0, numCards).map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.cardTab} ${activeCard === index ? styles.activeCardTab : ''}`}
                    onClick={() => setActiveCard(index)}
                  >
                    Card {index + 1}
                    {!cards[index].bodyText && <span className={styles.incompleteIndicator}>!</span>}
                  </button>
                ))}
              </div>
              
              <div className={styles.cardNavigationButtons}>
                <button
                  className={styles.cardNavButton}
                  onClick={() => navigateToCard('prev')}
                  disabled={activeCard === 0}
                >
                  <FiChevronLeft />
                  Previous
                </button>
                <button
                  className={styles.cardNavButton}
                  onClick={() => navigateToCard('next')}
                  disabled={activeCard === numCards - 1}
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
            
            <div className={styles.activeCardEditor}>
              {cards[activeCard] && (
                <CardTemplateEditor 
                  id={`card-${activeCard}`}
                  index={activeCard} 
                  card={cards[activeCard]} 
                  cards={cards}
                  updateCard={updateCard}
                  showHints={showHints}
                  validationMessage={
                    validationMessages[`card-${activeCard}`] || 
                    validationMessages[`card-${activeCard}-buttons`]
                  }
                />
              )}
            </div>
          </div>
          
          <div className={styles.fixedButtonGroup}>
            <div className={styles.actionStatus}>
              {justSaved && (
                <div className={styles.savedIndicator}>
                  <FiCheck size={16} />
                  Draft saved!
                </div>
              )}
            </div>
            
            <button 
              className={styles.backButton}
              onClick={() => setStep(1)}
            >
              <FiChevronLeft className={styles.buttonIcon} />
              Back
            </button>
            
            <button
              className={styles.saveButton}
              onClick={handleSaveDraft}
            >
              <FiSave className={styles.buttonIcon} />
              Save Draft
            </button>
            
            <button 
              className={styles.nextButton}
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Processing...
                </>
              ) : (
                <>
                  Create Template
                  <FiChevronRight className={styles.buttonIcon} />
                </>
              )}
            </button>
          </div>
          
          {error && <AlertMessage error={error} />}
        </div>

        {showPreview && (
          <div className={styles.previewContainer}>
            <div className={styles.previewWrapper}>
              <h3 className={styles.previewTitle}>Carousel Preview</h3>
              <p className={styles.previewSubtitle}>
                Live preview of how your carousel will appear in WhatsApp
              </p>
              <div className={styles.previewContent}>
                <CarouselPreview 
                  cards={cards.slice(0, numCards)} 
                  bodyText={bodyText} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTwo;