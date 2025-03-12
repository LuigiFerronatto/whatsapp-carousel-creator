// components/steps/StepTwo.js (Modificado)
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
  FiClipboard
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

  // Estado local
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
  
  // Refs
  const previewRef = useRef(null);
  const formContainerRef = useRef(null);

  // Verificar consistência de botões quando os cards ou numCards mudarem
  useEffect(() => {
    if (typeof checkButtonConsistency === 'function' && numCards > 1) {
      const consistency = checkButtonConsistency();
      setButtonConsistencyStatus(consistency);
    }
  }, [checkButtonConsistency, cards, numCards]);

  // Limpar validações quando inputs mudam
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

  // Mostrar erros recebidos como propriedades como alertas
  useEffect(() => {
    if (error) {
      alert.error(error, {
        position: 'top-center',
        autoCloseTime: 7000
      });
    }
  }, [error, alert]);

  // Status de validação
  const isTemplateNameValid = templateName && templateName.length >= 3;
  const isBodyTextValid = bodyText && bodyText.length > 0;

  // Validação de card completo
  const isCardComplete = (card) => {
    if (!card.bodyText) return false;
    
    // Verificar se todos os botões têm texto
    if (!card.buttons.every(button => button.text)) return false;
    
    // Verificar campos específicos para cada tipo de botão
    for (const button of card.buttons) {
      if (button.type === 'URL' && !button.url) return false;
      if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) return false;
    }
    
    return true;
  };

  // Calcular estado de completude para cada card
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

  // Gerar sugestões de nome de template com base no bodyText
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

  // Validação completa de cards e botões
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

    // Se tivermos erros, mostramos um alerta com as informações
    if (!allValid && validationErrors.length > 0) {
      alert.error("VALIDATION_ERRORS_FOUND", {
        position: 'top-center',
        autoCloseTime: 7000
      }, validationErrors.join('\n'));
    }

    return allValid;
  }, [cards, numCards, alert]);

  // Melhorado o handler para continuar, inclui validação e padronização
  const handleContinue = useCallback(async () => {
    // Validar nome do template
    if (!isTemplateNameValid) {
      alert.warning("TEMPLATE_NAME_SHORT", {
        position: 'top-center'
      });
      return;
    }

    // Validar texto de introdução
    if (!isBodyTextValid) {
      alert.warning("TEMPLATE_BODY_REQUIRED", {
        position: 'top-center'
      });
      return;
    }

    // Verificar consistência de botões se houver mais de um card
    if (numCards > 1 && typeof checkButtonConsistency === 'function') {
      const consistency = checkButtonConsistency();

      if (!consistency.isConsistent) {
        // Mostrar alerta sobre a inconsistência
        const shouldStandardize = window.confirm(
          "Os cards possuem configurações diferentes de botões, o que não é permitido pelo WhatsApp.\n\n" +
          "Deseja padronizar os botões automaticamente baseado no primeiro card?\n\n" +
          "Clique em OK para padronizar ou Cancelar para revisar manualmente."
        );

        if (shouldStandardize) {
          // Padronizar botões e continuar
          if (typeof applyButtonStandardization === 'function') {
            applyButtonStandardization();

            // Pequena pausa para processar as mudanças
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mostrar alerta de sucesso para padronização
            alert.success("BUTTON_STANDARDIZED", {
              position: 'bottom-right',
              autoCloseTime: 3000
            });
          }
        } else {
          // Usuário escolheu revisar manualmente
          return;
        }
      }
    }

    // Validar os cards
    if (validateCards()) {
      try {
        // Salvar antes de criar o template
        if (typeof saveCurrentState === 'function') {
          saveCurrentState();
        }
      
        // Tenta criar o template
        await handleCreateTemplate();
      } catch (err) {
        // Capturar e mostrar erros como alertas
        alert.error("TEMPLATE_CREATION_ERROR", {
          position: 'top-center',
          autoCloseTime: 7000
        }, err.message || 'Falha desconhecida');
      }}
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

  // Salvar rascunho
  const handleSaveBeforeUpload = useCallback(() => {
    // Verificar se a função saveCurrentState existe
    if (typeof saveCurrentState === 'function') {
      const success = saveCurrentState();

      if (success) {
        setSavedBeforeUpload(true);

        // Adicionar alerta de sucesso
        alert.success("DRAFT_SAVED", {
          position: 'bottom-right',
          autoCloseTime: 3000
        });

        setTimeout(() => {
          setSavedBeforeUpload(false);
        }, 5000);
      } else {
        // Mostrar erro se o salvamento falhou
        alert.error("DRAFT_SAVE_ERROR", {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }
    } else {
      // Mostrar erro se a função não estiver disponível
      console.error("Função saveCurrentState não está disponível");
      alert.error("DRAFT_SAVE_ERROR", {
        position: 'top-center'
      });
    }
  }, [saveCurrentState, alert]);

  // Verifica se o passo está completo
  const checkStepValidity = useCallback(() => {
    // Se a função isStepValid não estiver disponível, fazer validação local
    if (typeof isStepValid !== 'function') {
      // Verificar nome do template e texto
      if (!isTemplateNameValid || !isBodyTextValid) {
        return false;
      }

      // Verificar cards
      return validateCards();
    }

    // Se a função isStepValid estiver disponível, usar ela
    return isStepValid(2);
  }, [isStepValid, isTemplateNameValid, isBodyTextValid, validateCards]);
  
  // Função para navegar diretamente para um card com problemas
  const navigateToCard = (index) => {
    setActiveCard(index);
    setFocusedInput({ cardIndex: index, buttonIndex: null });
    
    // Rolagem suave até o editor de card
    document.querySelector(`.${styles.activeCardEditor}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Aplicar uma sugestão de nome de template
  const applyNameSuggestion = useCallback((suggestion) => {
    setTemplateName(suggestion);
    setShowNameSuggestions(false);
    
    alert.success("TEMPLATE_NAME_APPLIED", {
      position: 'bottom-right',
      autoCloseTime: 2000
    });
  }, [setTemplateName, alert]);

  // Toggle para expandir/recolher a prévia
  const togglePreviewExpanded = useCallback(() => {
    setPreviewExpanded(!previewExpanded);
    
    if (previewRef.current) {
      if (!previewExpanded) {
        // Expandindo a prévia: salva o scroll atual, depois faz scroll para a prévia
        setTimeout(() => {
          previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        // Recolhendo a prévia: retorna para onde estava
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [previewExpanded]);

  // Calcula o percentual de conclusão baseado no progresso
  const completionPercentage = [
    isTemplateNameValid,
    isBodyTextValid,
    cards.slice(0, numCards).every(card => card.bodyText),
    cards.slice(0, numCards).every(card => card.buttons.every(button => button.text)),
  ].filter(Boolean).length * 25;

  // Opções de idioma para o dropdown
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

  // NOVA FUNÇÃO: Calcular número de cards completos vs. incompletos
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

  // NOVO COMPONENTE: Card Checklist Modal
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

  return (
    <div className={steps.container}>
      <div className={steps.introStepWrapper}>
        <h2 className={steps.stepTitle}>Criação de Template</h2>
        <p className={steps.stepDescription}>
          Configure os detalhes do seu template, adicione os textos e botões para cada cartão.
        </p>
        
        {/* MODIFICADO: Barra de progresso da etapa melhorada */}
        <div className={steps.stepProgressContainer}>
          <div className={styles.progressStatus}>
            <span className={styles.progressLabel}>Progresso geral:</span>
            <div className={styles.stepProgressBarWrapper}>
              <div className={steps.stepProgressBar}>
                <div 
                  className={styles.stepProgressFill} 
                  style={{width: `${completionPercentage}%`}}
                ></div>
              </div>
              <span className={styles.progressPercentage}>{completionPercentage}%</span>
            </div>
          </div>
          
          {/* NOVA SEÇÃO: Estatísticas dos cards */}
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
      </div>
        
      <div className={`${styles.contentWrapper} ${previewExpanded ? styles.previewExpanded : ''}`}>
        <div 
          className={`${styles.formContainer} ${showPreview ? styles.withPreview : ''}`}
          ref={formContainerRef}
        >
          <div className={steps.containerCard}>
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
                  onChange={(e) => setTemplateName(e.target.value)}
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
                onChange={(e) => setLanguage(e.target.value)}
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
              />

              <div className={styles.bodyTextContainer}>
                <Input
                  id="bodyText"
                  name="bodyText"
                  type="textarea"
                  label="Mensagem de introdução"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
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
                />
              </div>
            </div>
          </div>

          {/* Alerta de inconsistência de botões */}
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
                      alert.success("BUTTON_STANDARDIZED", {
                        position: 'bottom-right'
                      });
                    }}
                  >
                    Padronizar botões automaticamente
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className={steps.containerCard}>
            <div className={steps.sectionHeader}>
              <div className={steps.sectionIconContainer}>
                <FiEdit size={24}/>
              </div>
              <h3>Conteúdo dos Cards</h3>
            </div>

            {/* MODIFICADO: Melhor navegação entre tabs */}
            <div className={styles.cardTabsContainer}>
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
              
              {/* NOVO: Mostrar dica ou progresso dos cards */}
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
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                  // NOVO: Passar informações sobre campos obrigatórios faltantes
                  missingFields={cardStatus[activeCard].missingFields}
                  isComplete={cardStatus[activeCard].complete}
                />
              )}
            </div>
          </div>

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

          {/* Mostrar informação de último salvamento */}
          {lastSavedTime && !savedBeforeUpload && (
            <div className={steps.lastSavedInfo}>
              <FiInfo size={14} />
              <span>
                Último salvamento: {new Date(lastSavedTime).toLocaleString()}
                {unsavedChanges && (
                  <span className={steps.unsavedIndicator}> (Alterações não salvas)</span>
                )}
              </span>
            </div>
          )}
        </div>

        {showPreview && (
          <div 
            className={`${styles.previewContainer} ${previewExpanded ? styles.expanded : ''}`}
            ref={previewRef}
          >
            <div className={styles.previewWrapper}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>Pré-visualização do Carrossel</h3>
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

      {/* Modal de visão geral dos cards */}
      {showCardOverview && (
        <CardOverviewModal onClose={() => setShowCardOverview(false)} />
      )}
    </div>
  );
};

export default StepTwo;