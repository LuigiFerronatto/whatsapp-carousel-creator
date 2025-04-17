// components/steps/StepOne.js - Com melhorias de UI/UX e novo componente ProgressBar
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import { useAlertService } from '../../hooks/common/useAlertService';
import Button from '../ui/Button/Button';
import ProgressBar from '../ui/ProgressBar/ProgressBar';
import {
  FiUpload,
  FiPlus,
  FiMinus,
  FiKey,
  FiArrowDown,
  FiInfo,
  FiCheckCircle,
  FiShield,
  FiFileText,
  FiImage,
  FiFilter
} from 'react-icons/fi';
import styles from './StepOne.module.css';
import steps from '../../styles/Steps.module.css';
import Input from '../ui/Input/Input';
import { saveDraft } from '../../services/storage/localStorageService';

/**
 * StepOne - Initial step for file configuration
 * Enhanced with better UI/UX and new ProgressBar component
 * 
 * @param {Object} props Component properties
 * @returns {JSX.Element} StepOne component
 */
const StepOne = ({
  authKey,
  setAuthKey,
  numCards,
  cards,
  updateCard,
  handleAddCard,
  handleRemoveCard,
  handleUploadFiles,
  loading,
  error,
  success,
  uploadResults,
  isStepValid,
  saveCurrentState,
  unsavedChanges,
  lastSavedTime
}) => {
  // Local state
  const [savedBeforeUpload] = useState(false);
  const [rememberKey, setRememberKey] = useState(() => {
    return localStorage.getItem('remember_auth_key') === 'true';
  });
  const [showTips, setShowTips] = useState(false);
  const [isKeyVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadActionStarted, setUploadActionStarted] = useState(false);
  const [keyValidationState, setKeyValidationState] = useState({ isValid: true, message: '' });
  const [cardUploadStatus, setCardUploadStatus] = useState([]);

  // Initialize alertService for better feedback
  const alert = useAlertService();

  // Refs
  const uploadSectionRef = useRef(null);

  // Initialize card upload status
  useEffect(() => {
    // Create an array to track each card's status
    const initialStatus = Array(numCards).fill().map((_, index) => ({
      cardIndex: index,
      hasFile: !!cards[index]?.fileUrl,
      fileType: cards[index]?.fileType || 'image',
      fileName: cards[index]?.fileName || '',
      uploadComplete: !!cards[index]?.fileUrl
    }));

    setCardUploadStatus(initialStatus);
  }, [numCards, cards]);

  // Update card status when cards change
  useEffect(() => {
    setCardUploadStatus(prevStatus =>
      prevStatus.map((status, index) => {
        if (index < cards.length) {
          return {
            ...status,
            hasFile: !!cards[index]?.fileUrl,
            fileType: cards[index]?.fileType || 'image',
            fileName: cards[index]?.fileName || '',
            uploadComplete: !!cards[index]?.fileUrl
          };
        }
        return status;
      })
    );
  }, [cards]);

  // Handle auth key in localStorage
  useEffect(() => {
    if (rememberKey && authKey) {
      localStorage.setItem('auth_key', authKey);
      localStorage.setItem('remember_auth_key', 'true');
    } else if (!rememberKey) {
      localStorage.removeItem('auth_key');
      localStorage.setItem('remember_auth_key', 'false');
    }
  }, [rememberKey, authKey]);

  // Load auth key from localStorage
  useEffect(() => {
    if (rememberKey && !authKey) {
      const savedKey = localStorage.getItem('auth_key');
      if (savedKey) {
        setAuthKey(savedKey);
      }
    }
  }, [rememberKey, authKey, setAuthKey]);

  // Scroll to upload section
  const scrollToUploadSection = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fallback save draft function
  const fallbackSaveDraft = useCallback(() => {
    try {
      // Create object with current state
      const currentState = {
        authKey,
        numCards,
        cards: cards.slice(0, numCards),
        lastSavedTime: new Date()
      };

      const success = saveDraft(currentState);

      if (success) {
        console.log('Draft saved with fallback mechanism');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in fallback save:', error);
      return false;
    }
  }, [authKey, numCards, cards]);

  // Check if all cards have valid URLs
  const allCardsHaveUrls = useCallback(() => {
    return cards.slice(0, numCards).every(card => card.fileUrl?.trim());
  }, [cards, numCards]);

  // Upload progress simulation with better visual feedback
  const simulateUploadProgress = useCallback(() => {
    setUploadProgress(0);
    setUploadActionStarted(true);

    // More realistic progress simulation with pauses
    const intervals = [
      { target: 15, time: 300 },
      { target: 35, time: 400 },
      { target: 65, time: 500 },
      { target: 85, time: 600 },
      { target: 95, time: 800 }
    ];

    let currentInterval = 0;

    const updateProgress = () => {
      if (currentInterval >= intervals.length) {
        return;
      }

      const { target, time } = intervals[currentInterval];

      const smallStep = (target - uploadProgress) / (time / 50);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newValue = prev + smallStep;
          if (newValue >= target) {
            clearInterval(interval);
            currentInterval++;

            if (currentInterval < intervals.length) {
              setTimeout(updateProgress, 200); // Small pause between phases
            }

            return target;
          }
          return newValue;
        });
      }, 50);

      return () => clearInterval(interval);
    };

    updateProgress();

    return () => {
      setUploadActionStarted(false);
      setUploadProgress(0);
    };
  }, [uploadProgress]);

  // Enhanced upload handler with better error handling and feedback
  const wrappedHandleUploadFiles = useCallback(async () => {
    try {
      // Validate auth key first
      if (!authKey) {
        setKeyValidationState({
          isValid: false,
          message: 'A chave de autorização é obrigatória'
        });

        alert.error('AUTH_KEY_REQUIRED', {
          position: 'top-center',
          autoCloseTime: 5000
        });
        return;
      }

      // Reset any previous validation errors
      setKeyValidationState({ isValid: true, message: '' });

      // Check if all cards have URLs
      if (!allCardsHaveUrls()) {
        alert.warning('CARD_URLS_REQUIRED', {
          position: 'top-center',
          autoCloseTime: 5000
        });
        return;
      }

      // Start progress simulation
      const stopProgress = simulateUploadProgress();

      // Show upload started alert
      alert.info("UPLOAD_STARTED", {
        position: 'bottom-right',
        autoCloseTime: false,
        id: 'upload-progress'
      });

      // Try to save draft before upload
      try {
        let saveSuccess = false;

        // Try with saveCurrentState first
        if (typeof saveCurrentState === 'function') {
          saveSuccess = saveCurrentState();
        }

        // Try with fallback if needed
        if (!saveSuccess) {
          saveSuccess = fallbackSaveDraft();
        }

        if (saveSuccess) {
          console.log('State saved before upload');
        } else {
          console.warn('Could not save state before upload');
        }
      } catch (error) {
        console.error('Error trying to save state before upload:', error);
      }

      // Call original upload function
      await handleUploadFiles();

      // Set progress to 100% after successful upload
      setUploadProgress(100);

      // Stop progress simulation
      stopProgress();

      // Show success alert
      alert.success('UPLOAD_SUCCESS', {
        position: 'bottom-right',
        autoCloseTime: 3000
      });

      // Update each card's upload status
      setCardUploadStatus(prevStatus =>
        prevStatus.map((status, index) => {
          if (index < numCards) {
            return {
              ...status,
              uploadComplete: !!cards[index]?.fileUrl
            };
          }
          return status;
        })
      );

    } catch (err) {
      // Reset progress in case of error
      setUploadProgress(0);
      setUploadActionStarted(false);

      // Show error alert with more details
      alert.error('UPLOAD_ERROR', {
        position: 'top-center',
        autoCloseTime: 7000
      }, err.message || 'Unknown error');
    }
  }, [authKey, allCardsHaveUrls, handleUploadFiles, alert, saveCurrentState, simulateUploadProgress, fallbackSaveDraft, cards, numCards]);

  // Show alerts for existing errors and successes
  useEffect(() => {
    if (error) {
      alert.error(error, {
        position: 'top-center',
        autoCloseTime: 7000
      });
    }

    if (success) {
      alert.success(success, {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
    }
  }, [error, success, alert]);

  // Enhanced step validation
  const checkStepValidity = useCallback(() => {
    // If isStepValid function isn't available, do local validation
    if (typeof isStepValid !== 'function') {
      // Check for auth key
      if (!authKey) {
        return false;
      }

      // Check if all cards have URLs
      return allCardsHaveUrls();
    }

    // Use provided isStepValid function if available
    return isStepValid(1);
  }, [isStepValid, authKey, allCardsHaveUrls]);

  // Auth key validation
  const validateAuthKey = useCallback((key) => {
    if (!key) {
      setKeyValidationState({
        isValid: false,
        message: 'A chave de autorização é obrigatória'
      });
      return false;
    }

    // Basic format validation - check if it starts with "Key " followed by alphanumeric characters
    if (!/^Key\s+[A-Za-z0-9]+$/.test(key)) {
      setKeyValidationState({
        isValid: false,
        message: 'Formato de chave inválido. Use o formato: Key XXXXX'
      });
      return false;
    }

    setKeyValidationState({ isValid: true, message: '' });
    return true;
  }, []);

  // Handle auth key change with validation
  const handleAuthKeyChange = useCallback((e) => {
    const newKey = e.target.value;
    setAuthKey(newKey);
    validateAuthKey(newKey);
  }, [setAuthKey, validateAuthKey]);

  // Calculate overall step progress
  const calculateStepProgress = useCallback(() => {
    let points = 0;
    let totalPoints = 2; // Auth key + at least one card with file

    // Check auth key
    if (authKey && keyValidationState.isValid) {
      points++;
    }

    // Check cards with files
    const cardsWithFiles = cards.slice(0, numCards).filter(card => card.fileUrl).length;
    if (cardsWithFiles > 0) {
      points += (cardsWithFiles / numCards); // Partial points based on completion
    }

    return Math.min(100, Math.floor((points / totalPoints) * 100));
  }, [authKey, keyValidationState.isValid, cards, numCards]);

  // Calculate card upload progress
  const calculateCardUploadProgress = useCallback(() => {
    const uploadedCards = cardUploadStatus.filter(status => status.uploadComplete).length;
    return Math.floor((uploadedCards / numCards) * 100);
  }, [cardUploadStatus, numCards]);

  // The card status text
  const getCardStatusText = useCallback(() => {
    const uploadedCards = cardUploadStatus.filter(status => status.uploadComplete).length;

    if (uploadedCards === numCards) {
      return "Todos os cards estão prontos!";
    }

    return `${uploadedCards} de ${numCards} cards prontos`;
  }, [cardUploadStatus, numCards]);

  return (
    <div className={steps.container}>
      {/* Upload progress indicator - only shown when upload is in progress */}
      {uploadActionStarted && (
        <div className={styles.progressOverlay}>
          <div className={styles.progressIndicator}>
            <ProgressBar
              value={uploadProgress}
              variant="upload"
              size="large"
              showLabel={true}
              label={uploadProgress < 100 ? `Enviando arquivos... ${Math.round(uploadProgress)}%` : "Upload concluído!"}
              showStatus={uploadProgress === 100}
              statusVariant="success"
            />
          </div>
        </div>
      )}

      {/* Introduction section */}
      <div className={steps.introStepWrapper}>
        <h2 className={steps.stepTitle}>Configuração de Arquivos</h2>
        <p className={steps.stepDescription}>
          Nesta etapa, você configurará as imagens ou vídeos que serão exibidos no seu carrossel do WhatsApp
          e fornecerá a chave de autorização necessária para fazer o upload dos arquivos.
        </p>
      </div>

      {/* New Step Progress UI with ProgressBar component */}
      <div className={styles.stepProgressSection}>
        <div className={styles.progressRow}>
          <div className={styles.progressItem}>
            <span className={styles.progressLabel}>
              <FiFileText size={16} />
              Progresso geral
            </span>
            <ProgressBar
              value={calculateStepProgress()}
              variant="step"
              size="medium"
              showLabel={false}
              statusText={calculateStepProgress() === 100 ? "Pronto para continuar!" : null}
              statusVariant="success"
            />
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressItem}>
            <span className={styles.progressLabel}>
              <FiImage size={16} />
              Cards
            </span>
            <ProgressBar
              value={calculateCardUploadProgress()}
              variant={calculateCardUploadProgress() === 100 ? "success" : "default"}
              size="medium"
              showLabel={false}
              statusText={getCardStatusText()}
              statusVariant={calculateCardUploadProgress() === 100 ? "success" : "warning"}
            />
          </div>
        </div>
      </div>

      {/* Authentication section */}
      <div className={steps.containerCard}>
        <div className={steps.sectionHeader}>
          <div className={steps.sectionIconContainer}>
            <FiKey size={24} />
          </div>
          <h3>Autenticação</h3>

          {/* Authentication status indicator */}
          {authKey && keyValidationState.isValid && (
            <div className={styles.keyStatusBadge}>
              <FiCheckCircle size={16} className={styles.validKeyIcon} />
              <span>Chave válida</span>
            </div>
          )}
        </div>

        <div className={styles.authInputWrapper}>
          <Input
            id="authKey"
            name="authKey"
            label="Chave de Autorização (Router Key)"
            type={isKeyVisible ? "text" : "password"}
            value={authKey}
            onChange={handleAuthKeyChange}
            onBlur={(e) => validateAuthKey(e.target.value)}
            placeholder="Digite sua chave de autorização, exemplo: 'Key XXXXXX'"
            hintMessage="Esta chave é necessária para enviar arquivos e criar templates. Você pode encontrá-la no portal Blip no seu roteador conectado ao Canal WhatsApp. Exemplo: Key cm90ZKDJWNSWyHJ72KK928DknMMnHksdwiOBnzhH=="
            hintVariant="simple"
            hintIsCompact={true}
            required
            error={!keyValidationState.isValid ? keyValidationState.message : ""}
          />
        </div>

        <div className={styles.authOptions}>
          <label className={styles.rememberKeyLabel}>
            <input
              type="checkbox"
              className={styles.rememberKeyCheckbox}
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
            />
            Lembrar minha chave
          </label>

          <div className={styles.securityNote}>
            <FiShield size={14} />
            <span>Sua chave é armazenada apenas no seu navegador</span>
          </div>
        </div>
      </div>

      {/* Card controls section */}
      <div className={styles.cardsControlSection}>
        <div className={steps.sectionHeader}>
          <div className={steps.sectionIconContainer}>
            <FiFilter size={24} />
          </div>
          <h3>Quantidade de Cards</h3>
        </div>
        <div className={styles.cardCounter}>
          <span className={styles.cardCountLabel}>Número de cards:</span>
          <div className={styles.buttonGroup}>
            <Button
              onClick={handleRemoveCard}
              disabled={numCards <= 2}
              className={styles.controlButton}
              aria-label="Remover card"
              variant="outline"
              color="content"
              size="small"
              iconLeft={<FiMinus size={18} />}
            />
            <span className={styles.cardCount}>{numCards}</span>
            <Button
              onClick={handleAddCard}
              disabled={numCards >= 10}
              className={styles.controlButton}
              aria-label="Adicionar card"
              variant="outline"
              color="content"
              size="small"
              iconLeft={<FiPlus size={18} />}
            />
          </div>
        </div>

        <div className={styles.cardControlOptions}>
          <p className={styles.cardControlHelp}>
            Um carrossel precisa de pelo menos 2 e no máximo 10 cards. Cada card terá uma imagem ou vídeo e botões interativos.
          </p>

          <div className={styles.cardTipsContainer}>
            <Button
              className={styles.tipsToggle}
              onClick={() => setShowTips(!showTips)}
              variant="text"
              color="content"
              size="small"
            >
              {showTips ? "Ocultar dicas" : "Mostrar dicas"}
            </Button>

            {showTips && (
              <div className={styles.cardTips}>
                <h4>Melhores práticas para imagens de carrossel:</h4>
                <ul>
                  <li>Tamanho recomendado: 800×418 pixels</li>
                  <li>Use as mesmas dimensões para todas as imagens para uma exibição consistente</li>
                  <li>Mantenha os arquivos abaixo de 5MB para carregamento rápido</li>
                  <li>Para vídeos, mantenha a duração abaixo de 60 segundos</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          color="primary"
          onClick={scrollToUploadSection}
          iconRight={<FiArrowDown size={14} />}
          className={styles.jumpToCardsButton}
        >
          Ver todos os cards
        </Button>
      </div>

      {/* Card upload grid with enhanced status tracking */}
      <div className={styles.cardsGrid} ref={uploadSectionRef}>
        {cards.slice(0, numCards).map((card, index) => (
          <CardUploadInput
            key={index}
            index={index}
            card={card}
            updateCard={updateCard}
            totalCards={numCards}
          />
        ))}
      </div>

      {/* Action buttons with enhanced visual feedback */}
      <div className={styles.actionSection}>
        <div className={steps.actionSection}>
          {/* <Button 
            variant="outline"
            color="primary"
            size="large"
            onClick={handleSaveBeforeUpload}
            iconLeft={savedBeforeUpload ? <FiCheckCircle size={18} /> : <FiSave size={18} />}
            className={savedBeforeUpload ? styles.savedButton : ''}
          >
            {savedBeforeUpload ? 'Salvo!' : 'Salvar Rascunho'}
          </Button> */}

          <Button
            variant="solid"
            color="primary"
            size="large"
            loading={loading}
            disabled={!checkStepValidity() || loading}
            iconLeft={loading ? null : <FiUpload size={18} />}
            onClick={wrappedHandleUploadFiles}
            className={styles.uploadButton}
          >
            {loading ? 'Processando uploads...' : 'Enviar Arquivos & Continuar'}
          </Button>
        </div>

        {/* Status messages */}
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

      {/* Upload summary with enhanced UI */}
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>
            <FiCheckCircle size={18} className={styles.summaryTitleIcon} />
            Resumo do upload:
          </div>
          <ul className={styles.summaryList}>
            {uploadResults.map((result, idx) => (
              <li key={idx} className={styles.summaryItem}>
                Card {result.cardIndex !== undefined ? result.cardIndex + 1 : idx + 1}:
                <span className={
                  result.status === 'success' ? styles.successStatus :
                    result.status === 'cached' ? styles.cachedStatus :
                      styles.simulatedStatus
                }>
                  {result.status === 'success' ? ' Upload bem-sucedido' :
                    result.status === 'cached' ? ' Carregado do cache' :
                      ' Simulado para teste'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StepOne;