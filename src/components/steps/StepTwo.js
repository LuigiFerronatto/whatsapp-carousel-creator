// components/steps/StepTwo.js - Versão melhorada
import React, { useState, useEffect, useCallback } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import { useAlert } from '../ui/AlertMessage/AlertContext';
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
  FiAlertTriangle
} from 'react-icons/fi';
import styles from './StepTwo.module.css';
import steps from '../../styles/Steps.module.css';
import progressbar from '../ui/ProgressBar/ProgressBar.module.css';

/**
 * StepTwo - Componente melhorado para a segunda etapa de configuração do template
 * Corrigido para utilizar saveCurrentState em vez de saveDraftManually
 * 
 * @param {Object} props Propriedades do componente
 * @returns {JSX.Element} Componente StepTwo
 */
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
  saveCurrentState, // Substituído de saveDraftManually para saveCurrentState
  unsavedChanges,
  lastSavedTime,
  checkButtonConsistency, // Adicionada verificação de consistência
  applyButtonStandardization // Adicionada padronização de botões
}) => {
  // Inicializar sistema de alertas
  const alert = useAlert();

  // Estado local
  const [showHints, setShowHints] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [validationMessages, setValidationMessages] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [buttonConsistencyStatus, setButtonConsistencyStatus] = useState({ isConsistent: true, message: "" });
  const [focusedInput, setFocusedInput] = useState({ cardIndex: null, buttonIndex: null });

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
      alert.error(`Problemas de validação encontrados:\n${validationErrors.join('\n')}`, {
        position: 'top-center',
        autoCloseTime: 7000
      });
    }

    return allValid;
  }, [cards, numCards, alert]);

  // Melhorado o handler para continuar, inclui validação e padronização
  const handleContinue = useCallback(async () => {
    // Validar nome do template
    if (!isTemplateNameValid) {
      alert.warning("O nome do template deve ter pelo menos 3 caracteres", {
        position: 'top-center'
      });
      return;
    }

    // Validar texto de introdução
    if (!isBodyTextValid) {
      alert.warning("A mensagem de introdução é obrigatória", {
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

        // Em caso de sucesso, mostra alerta
        alert.success("Template criado com sucesso!", {
          position: 'top-right'
        });
      } catch (err) {
        // Capturar e mostrar erros como alertas
        alert.error(`Erro ao criar template: ${err.message || 'Falha desconhecida'}`, {
          position: 'top-center',
          autoCloseTime: 7000
        });
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

  // Salvar rascunho
  const handleSaveBeforeUpload = useCallback(() => {
    // Verificar se a função saveCurrentState existe
    if (typeof saveCurrentState === 'function') {
      const success = saveCurrentState();

      if (success) {
        setSavedBeforeUpload(true);

        // Adicionar alerta de sucesso
        alert.success("Rascunho salvo com sucesso!", {
          position: 'bottom-right',
          autoCloseTime: 3000
        });

        setTimeout(() => {
          setSavedBeforeUpload(false);
        }, 5000);
      } else {
        // Mostrar erro se o salvamento falhou
        alert.error("Não foi possível salvar o rascunho. Verifique o armazenamento local.", {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }
    } else {
      // Mostrar erro se a função não estiver disponível
      console.error("Função saveCurrentState não está disponível");
      alert.error("Não foi possível salvar o rascunho. Tente novamente mais tarde.", {
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

  return (
    <div className={steps.container}>
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>Criação de Template</h2>
        <p className={steps.stepDescription}>
          Configure os detalhes do seu template, adicione os textos iniciais dos cartões, adicione formatação para os textos e veja o preview logo ao lado!
        </p>

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
      </div>

      <div className={styles.contentWrapper}>
        <div className={`${styles.formContainer} ${showPreview ? styles.withPreview : ''}`}>
          <div className={steps.containerCard}>
            <h3>Informações Básicas do Template</h3>

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
                    '✓ Todos os campos preenchidos!' :
                    `${completionPercentage}% concluído`}
                </span>
              </div>
            </div>

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
                      alert.success("Botões padronizados com sucesso!", {
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
            <h3>Conteúdo dos Cards</h3>

            <div className={styles.cardTabs}>
              {cards.slice(0, numCards).map((_, index) => (
                <Button
                  key={index}
                  className={`${styles.cardTab} ${activeCard === index ? styles.activeCardTab : ''}`}
                  onClick={() => setActiveCard(index)}
                  variant={activeCard === index ? "solid" : "outline"}
                  color={activeCard === index ? "primary" : "content"}
                  size="small"
                >
                  Card {index + 1}
                  {!cards[index].bodyText && <span className={styles.incompleteIndicator}>!</span>}
                </Button>
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
                  focusedInput={focusedInput}
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
            <div className={styles.lastSavedInfo}>
              <FiInfo size={14} />
              <span>
                Último salvamento: {new Date(lastSavedTime).toLocaleString()}
                {unsavedChanges && (
                  <span className={styles.unsavedIndicator}> (Alterações não salvas)</span>
                )}
              </span>
            </div>
          )}
        </div>

        {showPreview && (
          <div className={styles.previewContainer}>
            <div className={styles.previewWrapper}>
              <h3 className={styles.previewTitle}>Pré-visualização do Carrossel</h3>
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
    </div>
  );
};

export default StepTwo;

