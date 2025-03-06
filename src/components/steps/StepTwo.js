// components/steps/StepTwo.js
import React, { useState, useEffect } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import Input from '../ui/Input/Input'; // Already imported in your original code
import { 
  FiSave, 
  FiCheck, 
  FiChevronRight, 
  FiChevronLeft, 
  FiEye, 
  FiEyeOff, 
  FiInfo 
} from 'react-icons/fi';
import styles from './StepTwo.module.css';
import steps from '../../styles/Steps.module.css';
import progressbar from '../ui/ProgressBar/ProgressBar.module.css';

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
    <div className={steps.container}>
      <div className={steps.introSection}>

        <h2 className={steps.stepTitle}>Template Creation</h2>
        <p className={steps.stepDescription}>
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


            <div className={progressbar.progressContainer}>
              <div className={progressbar.progressBarWrapper}>
                <div className={progressbar.progressBar}>
                  <div
                    className={progressbar.progressFill}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <span className={progressbar.progressText}>
                  {completionPercentage === 100 ?
                    '✓ All fields completed!' :
                    `${completionPercentage}% completed`}
                </span>
              </div>
            </div>


            <Input
  id="templateName"
  name="templateName"
  label="Nome do Template"
  value={templateName}
  onChange={(e) => setTemplateName(e.target.value)}
  placeholder="exemplo: meu_carrossel_promocional"
  required
  minLength={3}
  maxLength={64}
  error={!isTemplateNameValid && templateName ? "O nome do template deve ter pelo menos 3 caracteres." : ""}
  hint={showHints ? "Escolha um nome descritivo, sem espaços. Exemplo: 'promo_verao' ou 'lançamento_produto'." : ""}
  variant="templateName"
  showCharCounter
  useHintsComponent={showHints}
  hintVariant="simple"
/>

<Input
  id="language"
  name="language"
  label="Idioma do Template"
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
  placeholder="Escolha um idioma"
  required
  isDropdown = {true}
  options={languageOptions}
  optionLabelKey="name"
  optionValueKey="code"
  searchable = {false}
  hint={showHints ? "Selecione o idioma principal do seu template. O idioma correto facilita a aprovação pelo WhatsApp." : ""}
  useHintsComponent={showHints}
  hintVariant="simple"
/>


  <Input
  id="bodyText"
  name="bodyText"
  type="textarea"
  label="Mensagem de introdução"
  value={bodyText}
  onChange={(e) => setBodyText(e.target.value)}
  placeholder="Esse texto aparecerá antes do carrossel. Seja claro e envolvente para seus clientes."
  maxLength={1024}
  showCharCounter
  rows={3}
  required
  hint={showHints ? "Escreva de forma objetiva e cativante. Esse texto introduz o carrossel e aparece acima na conversa." : ""}
  textFormatting
  useHintsComponent={showHints}
  hintVariant="simple"
  />
          </div>

          <div className={styles.cardEditorSection}>
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

            <div className={styles.activeCardEditor}>
              {cards[activeCard] && (
                <CardTemplateEditor
                  id={`card-${activeCard}`}
                  index={activeCard}
                  card={cards[activeCard]}
                  cards={cards}
                  updateCard={updateCard}
                  showHints={showHints}
                  numCards={numCards}
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