// components/steps/StepOne.js - Melhorado
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import { useAlert } from '../ui/AlertMessage/AlertContext'; 
import Button from '../ui/Button/Button';
import { 
  FiUpload, 
  FiPlus, 
  FiMinus, 
  FiKey, 
  FiArrowDown, 
  FiSave, 
  FiInfo, 
  FiCheckCircle,
  FiDownload,
  FiShield
} from 'react-icons/fi';
import styles from './StepOne.module.css';
import steps from '../../styles/Steps.module.css';
import Input from '../ui/Input/Input';

/**
 * StepOne - Initial step for file configuration
 * Enhanced with better UI/UX based on the design system
 * Fixed issues with saveDraftManually and step validation
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
  saveCurrentState, // Usar saveCurrentState em vez de saveDraftManually
  unsavedChanges,
  lastSavedTime
}) => {
  // Local state
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [rememberKey, setRememberKey] = useState(() => {
    return localStorage.getItem('remember_auth_key') === 'true';
  });
  const [showTips, setShowTips] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Initialize alert system
  const alert = useAlert();
  
  // Refs
  const uploadSectionRef = useRef(null);
  
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
  
  // Save draft before upload
  const handleSaveBeforeUpload = useCallback(() => {
    // Verifica se a função saveCurrentState existe
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
        }, 3000);
      } else {
        // Mostrar erro se o salvamento falhou
        alert.error("Não foi possível salvar o rascunho.", {
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
  
  // Check if all cards have valid URLs
  const allCardsHaveUrls = useCallback(() => {
    return cards.slice(0, numCards).every(card => card.fileUrl?.trim());
  }, [cards, numCards]);

  // Simulação de progresso de upload
  const simulateUploadProgress = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newValue = prev + (Math.random() * 10);
        if (newValue >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newValue;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Wrapper para verificar e mostrar alertas antes do upload
  const wrappedHandleUploadFiles = useCallback(async () => {
    try {
      // Verificar se temos a chave de autenticação
      if (!authKey) {
        alert.error("Chave de autorização (Router Key) é obrigatória para continuar", {
          position: 'top-center'
        });
        return;
      }
      
      // Verificar se todos os cards têm URLs
      if (!allCardsHaveUrls()) {
        alert.warning("Adicione arquivos para todos os cards antes de continuar", {
          position: 'top-center'
        });
        return;
      }
      
      // Iniciar simulação de progresso
      const stopProgress = simulateUploadProgress();
      
      // Salvar rascunho antes de upload
      if (typeof saveCurrentState === 'function') {
        saveCurrentState();
      }
      
      // Chamar a função original de upload
      await handleUploadFiles();
      
      // Garantir que o progresso termine em 100%
      setUploadProgress(100);
      
      // Parar simulação de progresso
      stopProgress();
      
      // Mostrar alerta de sucesso se não ocorreu erro
      alert.success("Upload de arquivos concluído com sucesso!", {
        position: 'top-right'
      });
    } catch (err) {
      // Zerar progresso em caso de erro
      setUploadProgress(0);
      
      // Capturar e mostrar erros como alertas
      alert.error(`Erro no upload dos arquivos: ${err.message || 'Erro desconhecido'}`, {
        position: 'top-center',
        autoCloseTime: 7000
      });
    }
  }, [authKey, allCardsHaveUrls, handleUploadFiles, alert, saveCurrentState, simulateUploadProgress]);

  // Mostrar alertas para erros e sucessos existentes
  useEffect(() => {
    if (error) {
      alert.error(error, { position: 'top-center' });
    }
    
    if (success) {
      alert.success(success, { position: 'top-right' });
    }
  }, [error, success, alert]);

  // Verifica quantos cards já possuem fileHandles
  const cardsWithFileHandles = cards.slice(0, numCards).filter(card => 
    card.fileUrl && card.fileHandle && card.fileHandle !== ''
  ).length;

  // Função para limpar todos os fileHandles
  const handleClearAllFileHandles = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar tudo? Isso forçará um novo upload para todos os cards.')) {
      // Atualizar cada card para remover fileHandle
      for (let i = 0; i < numCards; i++) {
        updateCard(i, 'fileHandle', '');
      }
      
      // Mostrar alerta de limpeza
      alert.info('Todos os arquivos foram limpos. Você precisará fazer upload novamente.', {
        position: 'top-center',
        autoCloseTime: 3000
      });
    }
  }, [cards, numCards, updateCard, alert]);

  // Verifica se o passo é válido
  const checkStepValidity = useCallback(() => {
    // Se a função isStepValid não estiver disponível, fazer validação local
    if (typeof isStepValid !== 'function') {
      // Verificar se temos a chave de autenticação
      if (!authKey) {
        return false;
      }
      
      // Verificar se todos os cards têm URLs
      return allCardsHaveUrls();
    }
    
    // Se a função isStepValid estiver disponível, usar ela
    return isStepValid(1);
  }, [isStepValid, authKey, allCardsHaveUrls]);

  // Calcular porcentagem de progresso para esta etapa
  const calculateProgress = () => {
    let points = 0;
    let total = 2; // Auth key + pelo menos um card deve ter URL
    
    if (authKey) points++;
    if (allCardsHaveUrls()) points++;
    
    return Math.floor((points / total) * 100);
  };
  
  const progressPercentage = calculateProgress();

  return (
    <div className={steps.container}>
      {/* Introduction section */}
      <div className={steps.introStepWrapper}>
        <h2 className={steps.stepTitle}>Configuração de Arquivos</h2>
        <p className={steps.stepDescription}>
          Nesta etapa, você configurará as imagens ou vídeos que serão exibidos no seu carrossel do WhatsApp
          e fornecerá a chave de autorização necessária para fazer o upload dos arquivos.
        </p>
        
        {/* Barra de progresso da etapa */}
        <div className={steps.stepProgressContainer}>
          <div className={steps.stepProgressBar}>
            <div 
              className={steps.stepProgressFill} 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
          <span className={steps.stepProgressText}>
            {progressPercentage === 100 ? 'Pronto para continuar!' : `${progressPercentage}% completo`}
          </span>
        </div>
      </div>

      
          <div className={steps.containerCard}>
            <div className={steps.sectionHeader}>
              <div className={steps.sectionIconContainer}>
                <FiKey size={24} />
              </div>
              <h3>Autenticação</h3>
            </div>
            
            <div className={styles.authInputWrapper}>
              <Input 
                id="authKey"
                name="authKey"
                label="Chave de Autorização (Router Key)"
                type={isKeyVisible ? "text" : "password"}
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                placeholder="Digite sua chave de autorização"
                hintMessage="Esta chave é necessária para enviar arquivos e criar templates. Você pode encontrá-la no portal Blip no seu roteador conectado ao Canal WhatsApp."
                hintVariant="simple"
                hintIsCompact={true}
                required
                error=""
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
                <FiKey size={24} />
              </div>
              <h3>Autenticação</h3>
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
      
      {/* Card upload grid */}
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
      
      {/* Action buttons */}
      <div className={styles.actionSection}>
        <div className={steps.actionSection}>
          <Button 
            variant="outline"
            color="primary"
            size="large"
            onClick={handleSaveBeforeUpload}
            iconLeft={savedBeforeUpload ? <FiCheckCircle size={18} /> : <FiSave size={18} />}
          >
            {savedBeforeUpload ? 'Salvo!' : 'Salvar Rascunho'}
          </Button>
          
          <Button 
            variant="solid"
            color="primary"
            size="large"
            loading={loading}
            disabled={!checkStepValidity() || loading}
            iconLeft={loading ? null : <FiUpload size={18} />}
            onClick={wrappedHandleUploadFiles}
          >
            {loading ? 'Processando uploads...' : 'Enviar Arquivos & Continuar'}
          </Button>
        </div>
        
        {/* Barra de progresso de upload */}
        {loading && (
          <div className={styles.uploadProgressContainer}>
            <div className={styles.uploadProgressBar}>
              <div 
                className={styles.uploadProgressFill} 
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
            <span className={styles.uploadProgressText}>
              {uploadProgress < 100 ? `Enviando arquivos... ${Math.floor(uploadProgress)}%` : 'Upload concluído!'}
            </span>
          </div>
        )}
        
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
      
      {/* Upload summary */}
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>Resumo do upload:</div>
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