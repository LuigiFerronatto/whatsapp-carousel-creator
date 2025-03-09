// components/steps/StepTwo.js
import React, { useState, useEffect } from 'react';
import CardTemplateEditor from '../editors/CardTemplateEditor';
import CarouselPreview from '../previews/CarouselPreview';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
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

  const isTemplateNameValid = templateName.length >= 3;
  const isBodyTextValid = bodyText.length > 0;

  const validateCards = () => {
    const messages = {};
    let allValid = true;

    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.bodyText) {
        messages[`card-${index}`] = `O texto do Card ${index + 1} é obrigatório`;
        allValid = false;
      }

      if (card.buttons.some(button => !button.text)) {
        messages[`card-${index}-buttons`] = `Todos os botões do Card ${index + 1} devem ter texto`;
        allValid = false;
      }

      card.buttons.forEach((button, btnIndex) => {
        if (button.type === 'URL' && !button.url) {
          messages[`card-${index}-button-${btnIndex}`] = `URL é obrigatório para o botão ${btnIndex + 1}`;
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
    }
  };

  const handleSaveDraft = () => {
    saveDraftManually();
    setJustSaved(true);

    setTimeout(() => {
      setJustSaved(false);
    }, 3000);
  };

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
        <div className={`${styles.formContainer} ${showPreview ? styles.withPreview : ''}`}>
          <div className={styles.basicDetailsSection}>
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
              hintVariant="simple"
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

          <div className={styles.cardEditorSection}>
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

          <div className={styles.fixedButtonGroup}>
            <div className={styles.actionStatus}>
              {justSaved && (
                <div className={styles.savedIndicator}>
                  <FiCheck size={16} />
                  Rascunho salvo!
                </div>
              )}
            </div>

            <Button
              className={styles.backButton}
              onClick={() => setStep(1)}
              variant="outline"
              color="content"
              iconLeft={<FiChevronLeft className={styles.buttonIcon} />}
            >
              Voltar
            </Button>

            <Button
              className={styles.saveButton}
              onClick={handleSaveDraft}
              variant="outline"
              color="primary"
              iconLeft={<FiSave className={styles.buttonIcon} />}
            >
              Salvar Rascunho
            </Button>

            <Button
              className={styles.nextButton}
              onClick={handleContinue}
              disabled={loading}
              variant="solid"
              color="primary"
              loading={loading}
              iconRight={!loading ? <FiChevronRight className={styles.buttonIcon} /> : null}
            >
              {loading ? 'Processando...' : 'Criar Template'}
            </Button>
          </div>

          {error && <AlertMessage error={error} />}
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