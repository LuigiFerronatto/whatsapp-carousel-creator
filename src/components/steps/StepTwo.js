// components/steps/StepTwo.js (Enhanced Version)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import { useAlertService } from '../../hooks/common/useAlertService';
import Input from '../ui/Input/Input';
import Hints, { HintsGroup } from '../ui/Hints/Hints';
import Button from '../ui/Button/Button';
import {
  FiSave,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiCopy,
  FiCornerRightDown,
  FiRefreshCw,
  FiEdit,
  FiSmile,
  FiX,
  FiList,
  FiClipboard,
  FiArrowLeft,
  FiArrowRight,
  FiZap,
  FiLayers,
  FiMaximize,
  FiMinimize,
  FiFilter
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
  saveCurrentState,
  unsavedChanges,
  lastSavedTime,
  checkButtonConsistency,
  applyButtonStandardization
}) => {
  const alert = useAlertService();

  // Local state with enhancements
  const [showHints, setShowHints] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [validationMessages, setValidationMessages] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [buttonConsistencyStatus, setButtonConsistencyStatus] = useState({ isConsistent: true, message: "" });
  const [focusedInput, setFocusedInput] = useState({ cardIndex: null, buttonIndex: null });
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [templateNameSuggestions, setTemplateNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showCardOverview, setShowCardOverview] = useState(false);
  
  // New states for enhanced UX
  const [showAutoSavedNotification, setShowAutoSavedNotification] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [isCardFormMaximized, setIsCardFormMaximized] = useState(false);
  const [activeSection, setActiveSection] = useState('basic'); // 'basic' or 'cards'
  const [lastFieldChanged, setLastFieldChanged] = useState(null);
  const [transitioningCard, setTransitioningCard] = useState(false);
  const [buttonSyncDone, setButtonSyncDone] = useState(false); // Track button sync notification
  
  // Refs
  const previewRef = useRef(null);
  const formContainerRef = useRef(null);
  const cardEditorRef = useRef(null);

  // Check button consistency when cards or numCards change
  useEffect(() => {
    if (typeof checkButtonConsistency === 'function' && numCards > 1) {
      const consistency = checkButtonConsistency();
      setButtonConsistencyStatus(consistency);
    }
  }, [checkButtonConsistency, cards, numCards]);

  // Enhanced auto-save functionality
  useEffect(() => {
    if (unsavedChanges && typeof saveCurrentState === 'function') {
      // Clear existing timer
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      // Set new timer for auto-save
      const timer = setTimeout(() => {
        try {
          saveCurrentState();
          setShowAutoSavedNotification(true);
          setTimeout(() => setShowAutoSavedNotification(false), 3000);
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }, 30000); // Auto-save after 30 seconds of inactivity
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [unsavedChanges, saveCurrentState, autoSaveTimer]);

  // Clear validations when inputs change
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

  // Show errors received as properties as alerts
  useEffect(() => {
    if (error) {
      alert.error(error, {
        position: 'top-center',
        autoCloseTime: 7000
      });
    }
  }, [error, alert]);

  // Smooth transition when changing active card
  useEffect(() => {
    if (activeCard !== null) {
      setTransitioningCard(true);
      const timer = setTimeout(() => {
        setTransitioningCard(false);
      }, 300); // Match transition duration
      
      return () => clearTimeout(timer);
    }
  }, [activeCard]);

  // Track button sync notifications
  useEffect(() => {
    if (buttonSyncDone) {
      const timer = setTimeout(() => {
        setButtonSyncDone(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [buttonSyncDone]);

  // Validation statuses
  const isTemplateNameValid = templateName && templateName.length >= 3;
  const isBodyTextValid = bodyText && bodyText.length > 0;

  // Card completeness validation
  const isCardComplete = (card) => {
    if (!card.bodyText) return false;
    
    // Check if all buttons have text
    if (!card.buttons.every(button => button.text)) return false;
    
    // Check specific fields for each button type
    for (const button of card.buttons) {
      if (button.type === 'URL' && !button.url) return false;
      if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) return false;
    }
    
    return true;
  };

  // Calculate completion status for each card
  const cardStatus = cards.slice(0, numCards).map((card, index) => ({
    index,
    complete: isCardComplete(card),
    hasText: !!card.bodyText,
    buttonsComplete: card.buttons.every(button => {
      if (!button.text) return false;
      if (button.type === 'URL' && !button.url) return false;
      if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) return false;
      return true;
    }),
    missingFields: [
      !card.bodyText ? 'texto do card' : null,
      ...card.buttons.map((button, btnIndex) => {
        if (!button.text) return `texto do botão ${btnIndex + 1}`;
        if (button.type === 'URL' && !button.url) return `URL do botão ${btnIndex + 1}`;
        if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) return `telefone do botão ${btnIndex + 1}`;
        return null;
      })
    ].filter(Boolean)
  }));

  // Generate template name suggestions based on bodyText
  useEffect(() => {
    if (bodyText && !templateName) {
      const words = bodyText
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3);
      
      if (words.length > 0) {
        const suggestions = [
          words.join('_').substring(0, 20),
          `carousel_${words[0]}`,
          `template_${words[0]}`
        ];
        
        setTemplateNameSuggestions(suggestions);
        setShowNameSuggestions(true);
      }
    }
  }, [bodyText, templateName]);

  // Enhanced card and button validation
  const validateCards = useCallback(() => {
    const messages = {};
    let allValid = true;
    let validationErrors = [];

    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.bodyText) {
        messages[`card-${index}`] = `O texto do Card ${index + 1} é obrigatório`;
        validationErrors.push(`Card ${index + 1}: texto obrigatório`);
        allValid = false;
      }

      if (card.buttons.some(button => !button.text)) {
        messages[`card-${index}-buttons`] = `Todos os botões do Card ${index + 1} devem ter texto`;
        validationErrors.push(`Card ${index + 1}: todos os botões precisam de texto`);
        allValid = false;
      }

      card.buttons.forEach((button, btnIndex) => {
        if (button.type === 'URL' && !button.url) {
          messages[`card-${index}-button-${btnIndex}`] = `URL é obrigatório para o botão ${btnIndex + 1}`;
          validationErrors.push(`Card ${index + 1}, Botão ${btnIndex + 1}: URL obrigatório`);
          allValid = false;
        }
        if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
          messages[`card-${index}-button-${btnIndex}`] = `Número de telefone é obrigatório para o botão ${btnIndex + 1}`;
          validationErrors.push(`Card ${index + 1}, Botão ${btnIndex + 1}: número de telefone obrigatório`);
          allValid = false;
        }
      });
    });

    setValidationMessages(messages);

    // Show alert with errors if any
    if (!allValid && validationErrors.length > 0) {
      alert.error("Encontramos alguns erros que precisam ser corrigidos:", {
        position: 'top-center',
        autoCloseTime: 7000
      }, validationErrors.join('\n'));
      
      // Animate to first card with errors
      if (validationErrors.length > 0) {
        const firstErrorCardMatch = validationErrors[0].match(/Card (\d+)/);
        if (firstErrorCardMatch && firstErrorCardMatch[1]) {
          const firstErrorCardIndex = parseInt(firstErrorCardMatch[1]) - 1;
          if (activeCard !== firstErrorCardIndex) {
            setActiveCard(firstErrorCardIndex);
          }
        }
      }
    }

    return allValid;
  }, [cards, numCards, alert, activeCard]);

  // Enhanced continue handler with improved validation and standardization
  const handleContinue = useCallback(async () => {
    // Validate template name
    if (!isTemplateNameValid) {
      alert.warning("O nome do template deve ter pelo menos 3 caracteres", {
        position: 'top-center'
      });
      return;
    }

    // Validate intro text
    if (!isBodyTextValid) {
      alert.warning("É necessário incluir um texto de introdução", {
        position: 'top-center'
      });
      return;
    }

    // Check button consistency if there's more than one card
    if (numCards > 1 && typeof checkButtonConsistency === 'function') {
      const consistency = checkButtonConsistency();

      if (!consistency.isConsistent) {
        // Show alert about inconsistency with better UI
        const shouldStandardize = window.confirm(
          "⚠️ Inconsistência Detectada\n\n" +
          "Os cards possuem configurações diferentes de botões, o que não é permitido pelo WhatsApp.\n\n" +
          "Deseja padronizar os botões automaticamente baseado no primeiro card?\n\n" +
          "• OK para padronizar automaticamente\n• Cancelar para ajustar manualmente"
        );

        if (shouldStandardize) {
          // Standardize buttons and continue
          if (typeof applyButtonStandardization === 'function') {
            applyButtonStandardization();

            // Small pause to process changes
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Show success alert for standardization
            alert.success("Botões padronizados com sucesso!", {
              position: 'bottom-right',
              autoCloseTime: 3000
            });
          }
        } else {
          // User chose to review manually
          return;
        }
      }
    }

    // Validate cards
    if (validateCards()) {
      try {
        // Save before creating the template
        if (typeof saveCurrentState === 'function') {
          saveCurrentState();
        }
      
        // Attempt to create the template
        await handleCreateTemplate();
      } catch (err) {
        // Capture and show errors as alerts
        alert.error("Erro na criação do template:", {
          position: 'top-center',
          autoCloseTime: 7000
        }, err.message || 'Falha desconhecida');
      }
    }
  }, [
    isTemplateNameValid,
    isBodyTextValid,
    validateCards,
    handleCreateTemplate,
    alert,
    saveCurrentState,
    numCards,
    checkButtonConsistency,
    applyButtonStandardization
  ]);

  // Enhanced save draft function
  const handleSaveBeforeUpload = useCallback(() => {
    // Check if saveCurrentState function exists
    if (typeof saveCurrentState === 'function') {
      const success = saveCurrentState();

      if (success) {
        setSavedBeforeUpload(true);

        // Add success alert
        alert.success("Rascunho salvo com sucesso!", {
          position: 'bottom-right',
          autoCloseTime: 3000
        });

        setTimeout(() => {
          setSavedBeforeUpload(false);
        }, 5000);
      } else {
        // Show error if saving failed
        alert.error("Não foi possível salvar o rascunho", {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }
    } else {
      // Show error if function is not available
      console.error("saveCurrentState function is not available");
      alert.error("Função de salvamento não disponível", {
        position: 'top-center'
      });
    }
  }, [saveCurrentState, alert]);

  // Check if step is complete
  const checkStepValidity = useCallback(() => {
    // If isStepValid function is not available, do local validation
    if (typeof isStepValid !== 'function') {
      // Check template name and text
      if (!isTemplateNameValid || !isBodyTextValid) {
        return false;
      }

      // Check cards
      return validateCards();
    }

    // If isStepValid function is available, use it
    return isStepValid(2);
  }, [isStepValid, isTemplateNameValid, isBodyTextValid, validateCards]);
  
  // Function to navigate directly to a card with issues
  const navigateToCard = (index) => {
    setActiveCard(index);
    setFocusedInput({ cardIndex: index, buttonIndex: null });
    
    // Smooth scroll to card editor
    setTimeout(() => {
      cardEditorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Apply template name suggestion
  const applyNameSuggestion = useCallback((suggestion) => {
    setTemplateName(suggestion);
    setShowNameSuggestions(false);
    
    alert.success("Nome aplicado com sucesso!", {
      position: 'bottom-right',
      autoCloseTime: 2000
    });
    
    // Track the change
    setLastFieldChanged('templateName');
    setTimeout(() => setLastFieldChanged(null), 2000);
  }, [setTemplateName, alert]);

  // Toggle to expand/collapse preview
  const togglePreviewExpanded = useCallback(() => {
    setPreviewExpanded(!previewExpanded);
    
    if (previewRef.current) {
      if (!previewExpanded) {
        // Expanding preview: save current scroll, then scroll to preview
        setTimeout(() => {
          previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        // Collapsing preview: return to previous position
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [previewExpanded]);

  // Calculate completion percentage based on progress
  const completionPercentage = [
    isTemplateNameValid,
    isBodyTextValid,
    cards.slice(0, numCards).every(card => card.bodyText),
    cards.slice(0, numCards).every(card => card.buttons.every(button => button.text)),
    cards.slice(0, numCards).every(isCardComplete),
  ].filter(Boolean).length * 20;

  // Language options for dropdown
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

  // Calculate card completion statistics
  const cardCompletionStats = useCallback(() => {
    const total = numCards;
    const complete = cardStatus.filter(cs => cs.complete).length;
    const incomplete = total - complete;
    
    return {
      total,
      complete,
      incomplete,
      percentage: Math.round((complete / total) * 100)
    };
  }, [numCards, cardStatus]);

  // Enhanced card navigation
  const goToNextCard = useCallback(() => {
    if (activeCard < numCards - 1) {
      setActiveCard(prevCard => prevCard + 1);
    }
  }, [activeCard, numCards]);

  const goToPrevCard = useCallback(() => {
    if (activeCard > 0) {
      setActiveCard(prevCard => prevCard - 1);
    }
  }, [activeCard]);

  // NEW: Enhanced button change handler for all cards
  const handleButtonTypeChangeForAllCards = useCallback((buttonIndex, newType) => {
    if (window.confirm(`Esta ação alterará o tipo deste botão em TODOS os cards para "${newType}". Deseja continuar?`)) {
      // Apply to all cards
      for (let cardIdx = 0; cardIdx < numCards; cardIdx++) {
        // Create a copy of the buttons array for this card
        const newButtons = [...cards[cardIdx].buttons];
        if (buttonIndex < newButtons.length) {
          newButtons[buttonIndex] = {
            ...newButtons[buttonIndex],
            type: newType,
            // Make sure type-specific fields exist
            ...(newType === 'URL' && !newButtons[buttonIndex].url ? { url: '' } : {}),
            ...(newType === 'PHONE_NUMBER' && !newButtons[buttonIndex].phoneNumber ? { phoneNumber: '' } : {})
          };
          
          // Update the card with new buttons
          updateCard(cardIdx, 'buttons', newButtons);
        }
      }
      
      // Show notification
      alert.success(`Tipo de botão "${newType}" sincronizado em todos os cards!`, {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      
      setButtonSyncDone(true);
    }
  }, [cards, numCards, updateCard, alert]);

  // Card Checklist Modal Component
  const CardOverviewModal = ({ onClose }) => {
    const stats = cardCompletionStats();
    
    return (
      <div className={styles.cardOverviewModal}>
        <div className={styles.cardOverviewContent}>
          <div className={styles.cardOverviewHeader}>
            <h3>Visão Geral dos Cards</h3>
            <button onClick={onClose} className={styles.closeModalButton}>
              <FiX size={20} />
            </button>
          </div>
          
          <div className={styles.cardStats}>
            <div className={styles.cardStatItem}>
              <span className={styles.cardStatValue}>{stats.total}</span>
              <span className={styles.cardStatLabel}>Total</span>
            </div>
            <div className={styles.cardStatItem}>
              <span className={`${styles.cardStatValue} ${styles.complete}`}>{stats.complete}</span>
              <span className={styles.cardStatLabel}>Completos</span>
            </div>
            <div className={styles.cardStatItem}>
              <span className={`${styles.cardStatValue} ${styles.incomplete}`}>{stats.incomplete}</span>
              <span className={styles.cardStatLabel}>Incompletos</span>
            </div>
          </div>
          
          <div className={styles.cardProgressBar}>
            <div 
              className={styles.cardProgressFill} 
              style={{width: `${stats.percentage}%`}}
            >
              {stats.percentage > 15 && `${stats.percentage}%`}
            </div>
            {stats.percentage <= 15 && <span className={styles.outsidePercentage}>{stats.percentage}%</span>}
          </div>
          
          <div className={styles.cardList}>
            {cardStatus.map((status, idx) => (
              <div 
                key={idx} 
                className={`${styles.cardStatusItem} ${status.complete ? styles.cardComplete : styles.cardIncomplete}`}
                onClick={() => {
                  navigateToCard(idx);
                  onClose();
                }}
              >
                <div className={styles.cardStatusHeader}>
                  <span className={styles.cardNumber}>Card {idx + 1}</span>
                  {status.complete ? (
                    <FiCheckCircle className={styles.completeIcon} size={18} />
                  ) : (
                    <FiAlertTriangle className={styles.incompleteIcon} size={18} />
                  )}
                </div>
                
                {!status.complete && (
                  <div className={styles.cardMissingFields}>
                    <span className={styles.missingLabel}>Faltando:</span>
                    <ul className={styles.missingList}>
                      {status.missingFields.map((field, fieldIdx) => (
                        <li key={fieldIdx}>{field}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Section navigation with tabs
  const SectionTabs = () => (
    <div className={styles.sectionTabs}>
      <button 
        className={`${styles.sectionTab} ${activeSection === 'basic' ? styles.activeTab : ''}`}
        onClick={() => setActiveSection('basic')}
      >
        <FiEdit size={18} />
        <span>Informações Básicas</span>
        {(!isTemplateNameValid || !isBodyTextValid) && (
          <span className={styles.sectionErrorBadge}>
            <FiAlertTriangle size={14} />
          </span>
        )}
      </button>
      <button 
        className={`${styles.sectionTab} ${activeSection === 'cards' ? styles.activeTab : ''}`}
        onClick={() => setActiveSection('cards')}
      >
        <FiLayers size={18} />
        <span>Cards do Carrossel</span>
        {cardStatus.some(card => !card.complete) && (
          <span className={styles.sectionErrorBadge}>
            <span className={styles.badgeCount}>{cardStatus.filter(card => !card.complete).length}</span>
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div className={steps.container}>
      <div className={steps.introStepWrapper}>
        <h2 className={steps.stepTitle}>Criação de Template</h2>
        <p className={steps.stepDescription}>
          Configure os detalhes do seu template, adicione os textos e botões para cada cartão.
        </p>
        
        {/* Enhanced progress bar */}
        <div className={steps.stepProgressContainer}>
          <div className={styles.progressStatus}>
            <span className={styles.progressLabel}>Progresso geral:</span>
            <div className={styles.stepProgressBarWrapper}>
              <div className={styles.stepProgressBar}>
                <div 
                  className={styles.stepProgressFill} 
                  style={{width: `${completionPercentage}%`}}
                  data-percentage={`${completionPercentage}%`}
                ></div>
              </div>
              <span className={styles.progressPercentage}>{completionPercentage}%</span>
            </div>
          </div>
          
          {/* Card statistics */}
          <div className={styles.cardsStatus}>
            <span className={styles.progressLabel}>Cards:</span>
            <div className={styles.cardStatusBadges}>
              {cardCompletionStats().complete > 0 && (
                <span className={styles.completeBadge}>
                  <FiCheckCircle size={14} />
                  {cardCompletionStats().complete} completo{cardCompletionStats().complete !== 1 ? 's' : ''}
                </span>
              )}
              {cardCompletionStats().incomplete > 0 && (
                <span className={styles.incompleteBadge}>
                  <FiAlertTriangle size={14} />
                  {cardCompletionStats().incomplete} incompleto{cardCompletionStats().incomplete !== 1 ? 's' : ''}
                </span>
              )}
              <button
                className={styles.viewCardOverviewButton}
                onClick={() => setShowCardOverview(true)}
                title="Ver visão geral dos cards"
              >
                <FiList size={16} />
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced view controls */}
      <div className={styles.viewControls}>
        <Button
          className={styles.viewToggle}
          onClick={() => setShowPreview(!showPreview)}
          aria-label={showPreview ? "Ocultar visualização" : "Mostrar visualização"}
          variant="text"
          color="content"
          size="small"
          iconLeft={showPreview ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        >
          {showPreview ? "Ocultar visualização" : "Mostrar visualização"}
        </Button>

        <Button
          className={styles.hintsToggle}
          onClick={() => setShowHints(!showHints)}
          aria-label={showHints ? "Ocultar dicas" : "Mostrar dicas"}
          variant="text"
          color="content"
          size="small"
          iconLeft={<FiInfo size={16} />}
        >
          {showHints ? "Ocultar dicas" : "Mostrar dicas"}
        </Button>
        
        {/* NEW: Enhanced layout controls */}
        {showPreview && (
          <Button
            className={styles.expandToggle}
            onClick={togglePreviewExpanded}
            aria-label={previewExpanded ? "Minimizar prévia" : "Expandir prévia"}
            variant="text"
            color="content"
            size="small"
            iconLeft={previewExpanded ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          >
            {previewExpanded ? "Minimizar prévia" : "Expandir prévia"}
          </Button>
        )}
      </div>
        
      {/* Enhanced content wrapper with transitions */}
      <div className={`${styles.contentWrapper} ${previewExpanded ? styles.previewExpanded : ''}`}>
        <div 
          className={`${styles.formContainer} ${showPreview ? styles.withPreview : ''} ${isCardFormMaximized ? styles.maximized : ''}`}
          ref={formContainerRef}
        >
          {/* NEW: Section navigation */}
          <SectionTabs />
          
          {/* Basic Information Section */}
          <div className={`${steps.containerCard} ${activeSection !== 'basic' ? styles.hiddenSection : ''}`}>
            <div className={steps.sectionHeader}>
              <div className={steps.sectionIconContainer}>
                <FiEdit size={24}/>
              </div>
              <h3>Informações Básicas</h3>
            </div>

            <div className={styles.formFields}>
              <div className={styles.templateNameWrapper}>
                <Input
                  id="templateName"
                  name="templateName"
                  label="Nome do Template"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    setLastFieldChanged('templateName');
                    setTimeout(() => setLastFieldChanged(null), 2000);
                  }}
                  placeholder="Exemplo: meu_carrossel_promocional"
                  required
                  minLength={3}
                  maxLength={64}
                  error={validationMessages.templateName || (templateName && !isTemplateNameValid ? "O nome do template deve ter pelo menos 3 caracteres." : "")}
                  hintMessage={showHints ? "Escolha um nome descritivo, sem espaços." : ""}
                  hintVariant="info"
                  hintList={["Use _ para separar palavras", "Exemplo: 'promo_verao' ou 'lancamento_produto'"]}
                  size="medium"
                  fullWidth
                  clearable
                  variant="templateName"
                  allowFormatting
                  validateOnChange
                  hintIsCompact={true}
                  className={lastFieldChanged === 'templateName' ? styles.highlightedField : ''}
                />
                
                {showNameSuggestions && templateNameSuggestions.length > 0 && (
                  <div className={styles.nameSuggestions}>
                    <span className={styles.suggestionLabel}>Sugestões de nome:</span>
                    <div className={styles.suggestionButtons}>
                      {templateNameSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          color="primary"
                          size="small"
                          onClick={() => applyNameSuggestion(suggestion)}
                          className={styles.suggestionButton}
                        >
                          {suggestion}
                          <FiCornerRightDown size={14} />
                        </Button>
                      ))}
                    </div>
                    <button 
                      className={styles.dismissSuggestions}
                      onClick={() => setShowNameSuggestions(false)}
                    >
                      Dispensar sugestões
                    </button>
                  </div>
                )}
              </div>

              <Input
                id="language"
                name="language"
                label="Idioma do Template"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setLastFieldChanged('language');
                  setTimeout(() => setLastFieldChanged(null), 2000);
                }}
                placeholder="Escolha um idioma"
                required
                isDropdown={true}
                options={languageOptions}
                optionLabelKey="name"
                optionValueKey="code"
                hintMessage={showHints ? "Selecione o idioma principal do seu template. O idioma correto facilita a aprovação pelo WhatsApp." : ""}
                hintVariant="simple"
                size="medium"
                fullWidth
                hintIsCompact={true}
                searchable
                className={lastFieldChanged === 'language' ? styles.highlightedField : ''}
              />

              <div className={styles.bodyTextContainer}>
                <Input
                  id="bodyText"
                  name="bodyText"
                  type="textarea"
                  label="Mensagem de introdução"
                  value={bodyText}
                  onChange={(e) => {
                    setBodyText(e.target.value);
                    setLastFieldChanged('bodyText');
                    setTimeout(() => setLastFieldChanged(null), 2000);
                  }}
                  placeholder="Esse texto aparecerá antes do carrossel. Seja claro e envolvente para seus clientes."
                  maxLength={1024}
                  rows={3}
                  required
                  error={validationMessages.bodyText || (bodyText === "" ? "A mensagem de introdução é obrigatória." : "")}
                  hintMessage={showHints ? "Escreva de forma objetiva e cativante. Esse texto introduz o carrossel e aparece acima na conversa." : ""}
                  textFormatting
                  hintVariant="simple"
                  size="medium"
                  fullWidth
                  showCharCounter
                  clearable
                  hintIsCompact={true}
                  className={lastFieldChanged === 'bodyText' ? styles.highlightedField : ''}
                />
              </div>
            </div>
          </div>

          {/* Card Content Section */}
          <div className={`${steps.containerCard} ${activeSection !== 'cards' ? styles.hiddenSection : ''}`}>
            {/* Button inconsistency warning */}
            {numCards > 1 && !buttonConsistencyStatus.isConsistent && (
              <div className={styles.buttonInconsistencyWarning}>
                <FiAlertTriangle size={20} />
                <div>
                  <h4>Atenção! Inconsistência de botões detectada</h4>
                  <p>{buttonConsistencyStatus.message}</p>
                  {typeof applyButtonStandardization === 'function' && (
                    <Button
                      variant="outline"
                      color="warning"
                      size="small"
                      onClick={() => {
                        applyButtonStandardization();
                        alert.success("Botões padronizados com sucesso!", {
                          position: 'bottom-right'
                        });
                        setButtonSyncDone(true);
                      }}
                      iconLeft={<FiZap size={16} />}
                    >
                      Padronizar botões automaticamente
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconContainer}>
                <FiLayers size={24}/>
              </div>
              <h3>Conteúdo dos Cards</h3>
              
              {/* NEW: Card maximize/restore control */}
              <button 
                className={styles.maximizeCardFormButton}
                onClick={() => setIsCardFormMaximized(!isCardFormMaximized)}
                title={isCardFormMaximized ? "Restaurar visualização" : "Expandir editor de cards"}
              >
                {isCardFormMaximized ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
              </button>
            </div>

            {/* Enhanced card tabs with better navigation */}
            <div className={styles.cardTabsContainer}>
              {/* NEW: Card navigation buttons */}
              <div className={styles.cardNavigation}>
                <button 
                  className={styles.cardNavButton}
                  onClick={goToPrevCard}
                  disabled={activeCard <= 0}
                  title="Card anterior"
                >
                  <FiArrowLeft size={16} />
                </button>
                
                <div className={styles.cardTabs}>
                  {cards.slice(0, numCards).map((_, index) => {
                    const isComplete = cardStatus[index].complete;
                    const missingFields = cardStatus[index].missingFields;
                    
                    return (
                      <Button
                        key={index}
                        className={`${styles.cardTab} ${activeCard === index ? styles.activeCardTab : ''} ${
                          isComplete ? styles.completeCardTab : styles.incompleteCardTab
                        }`}
                        onClick={() => setActiveCard(index)}
                        variant={activeCard === index ? "solid" : "outline"}
                        color={activeCard === index ? (isComplete ? "success" : "primary") : "content"}
                        size="small"
                      >
                        Card {index + 1}
                        {isComplete ? (
                          <span className={styles.completeIndicator}>
                            <FiCheckCircle size={14} />
                          </span>
                        ) : (
                          <span className={styles.incompleteIndicator}>
                            {missingFields.length}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
                
                <button 
                  className={styles.cardNavButton}
                  onClick={goToNextCard}
                  disabled={activeCard >= numCards - 1}
                  title="Próximo card"
                >
                  <FiArrowRight size={16} />
                </button>
              </div>
              
              {/* Card completion hint */}
              {activeCard !== null && !cardStatus[activeCard].complete && (
                <div className={styles.cardCompletionHint}>
                  <FiInfo size={16} />
                  <div>
                    <strong>Campos faltantes no Card {activeCard + 1}:</strong>
                    <span className={styles.missingFieldsList}>
                      {cardStatus[activeCard].missingFields.join(', ')}
                    </span>
                  </div>
                </div>
              )}
              
              {/* NEW: Button synchronization info */}
              {numCards > 1 && (
                <div className={styles.cardSyncInfo}>
                  <div className={`${styles.syncIndicator} ${buttonSyncDone ? styles.syncDone : ''}`}>
                    {buttonSyncDone ? <FiCheckCircle size={14} /> : <FiRefreshCw size={14} className={styles.syncIcon} />}
                  </div>
                  <span>
                    {buttonSyncDone ? 
                      "Sincronização de botões concluída!" : 
                      "Alterações em botões serão sincronizadas em todos os cards."
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Active card editor with transition effect */}
            <div 
              className={`${styles.activeCardEditor} ${transitioningCard ? styles.cardTransitioning : ''}`}
              ref={cardEditorRef}
            >
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
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                  missingFields={cardStatus[activeCard].missingFields}
                  isComplete={cardStatus[activeCard].complete}
                  syncButtonTypeForAllCards={handleButtonTypeChangeForAllCards} // Pass the new sync function
                />
              )}
            </div>
          </div>

          {/* Action buttons section */}
          <div className={steps.actionSection}>
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              color="content"
              iconLeft={<FiChevronLeft />}
              size="large"
              fullWidth
            >
              Voltar
            </Button>

            <Button
              variant="outline"
              color="primary"
              size="large"
              onClick={handleSaveBeforeUpload}
              iconLeft={savedBeforeUpload ? <FiCheckCircle size={18} /> : <FiSave size={18} />}
              fullWidth
              className={savedBeforeUpload ? styles.savedButton : ''}
            >
              {savedBeforeUpload ? 'Salvo!' : 'Salvar Rascunho'}
            </Button>

            <Button
              className={styles.nextButton}
              onClick={handleContinue}
              disabled={loading || !checkStepValidity()}
              variant="solid"
              color="primary"
              loading={loading}
              iconRight={!loading ? <FiChevronRight /> : null}
              size="large"
              fullWidth
            >
              {loading ? 'Processando...' : 'Criar Template'}
            </Button>
          </div>

          {/* Save information */}
          <div className={`${steps.lastSavedInfo} ${showAutoSavedNotification ? styles.showAutoSave : ''}`}>
            <FiInfo size={14} />
            <span>
              {showAutoSavedNotification ? (
                <span className={styles.autoSaveNotification}>
                  <FiCheckCircle size={14} className={styles.autoSaveIcon} />
                  Salvo automaticamente
                </span>
              ) : lastSavedTime ? (
                <>
                  Último salvamento: {new Date(lastSavedTime).toLocaleString()}
                  {unsavedChanges && (
                    <span className={steps.unsavedIndicator}> (Alterações não salvas)</span>
                  )}
                </>
              ) : (
                "Nenhum salvamento realizado"
              )}
            </span>
          </div>
        </div>

        {/* Enhanced preview container */}
        {showPreview && (
          <div 
            className={`${styles.previewContainer} ${previewExpanded ? styles.expanded : ''}`}
            ref={previewRef}
          >
            <div className={styles.previewWrapper}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>
                  Pré-visualização do Carrossel
                  <button 
                    className={styles.previewToggleButton}
                    onClick={togglePreviewExpanded}
                    title={previewExpanded ? "Minimizar" : "Expandir"}
                  >
                    {previewExpanded ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
                  </button>
                </h3>
              </div>
              <p className={styles.previewSubtitle}>
                Visualização ao vivo de como seu carrossel aparecerá no WhatsApp
              </p>
              <div className={styles.previewContent}>
                <CarouselPreview
                  cards={cards.slice(0, numCards)}
                  bodyText={bodyText}
                  focusedInput={focusedInput}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card overview modal */}
      {showCardOverview && (
        <CardOverviewModal onClose={() => setShowCardOverview(false)} />
      )}
    </div>
  );
};

export default StepTwo;