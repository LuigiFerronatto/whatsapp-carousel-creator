// components/steps/StepTwo.js
import React, { useState, useEffect, useCallback } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import { useAlert } from '../ui/AlertMessage/AlertContext'; // Adicionar esta importação
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
  FiCheckCircle
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
  // Inicializar sistema de alertas
  const alert = useAlert();
  
  const [showHints, setShowHints] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [validationMessages, setValidationMessages] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);

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

  const isTemplateNameValid = templateName.length >= 3;
  const isBodyTextValid = bodyText.length > 0;

  const validateCards = () => {
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
  };

  const handleContinue = async () => {
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
    
    // Validar os cards
    if (validateCards()) {
      try {
        // Tenta criar o template
        await handleCreateTemplate();
        // Em caso de sucesso, mostra alerta (mesmo que a função já troque de tela)
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
  };

  const handleSaveBeforeUpload = useCallback(() => {
    saveDraftManually();
    setSavedBeforeUpload(true);
    
    // Adicionar alerta de sucesso
    alert.success("Rascunho salvo com sucesso!", {
      position: 'bottom-right',
      autoCloseTime: 3000
    });
    
    setTimeout(() => {
      setSavedBeforeUpload(false);
    }, 5000);
  }, [saveDraftManually, alert]);

  const isAllValid = isTemplateNameValid && isBodyTextValid && Object.keys(validationMessages).length === 0;

  const completionPercentage = [
    isTemplateNameValid,
    isBodyTextValid,
    cards.slice(0, numCards).every(card => card.bodyText),
    cards.slice(0, numCards).every(card => card.buttons.every(button => button.text)),
  ].filter(Boolean).length * 25;

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
        <div className={`${styles.formContainer}${showPreview ? styles.withPreview : ''}`}>
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
              error={!isTemplateNameValid && templateName ? "O nome do template deve ter pelo menos 3 caracteres." : ""}
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
              size='large'
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
              disabled={loading}
              variant="solid"
              color="primary"
              loading={loading}
              iconRight={!loading ? <FiChevronRight/> : null}
              size='large'
              fullWidth
            >
              {loading ? 'Processando...' : 'Criar Template'}
            </Button>
          </div>
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