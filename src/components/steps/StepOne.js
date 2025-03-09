// components/steps/StepOne.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import Button from '../ui/Button/Button';
import { 
  FiUpload, 
  FiPlus, 
  FiMinus, 
  FiKey, 
  FiArrowDown, 
  FiSave, 
  FiInfo, 
  FiCheckCircle
} from 'react-icons/fi';
import styles from './StepOne.module.css';
import steps from '../../styles/Steps.module.css';
import Input from '../ui/Input/Input';

/**
 * StepOne - Initial step for file configuration
 * Enhanced with better UI/UX based on the design system
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
  saveDraftManually
}) => {
  // Local state
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [rememberKey, setRememberKey] = useState(() => {
    return localStorage.getItem('remember_auth_key') === 'true';
  });
  const [showTips, setShowTips] = useState(true);
  
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
    saveDraftManually();
    setSavedBeforeUpload(true);
    
    setTimeout(() => {
      setSavedBeforeUpload(false);
    }, 3000);
  }, [saveDraftManually]);
  
  // Check if all cards have valid URLs
  const allCardsHaveUrls = useCallback(() => {
    return cards.slice(0, numCards).every(card => card.fileUrl?.trim());
  }, [cards, numCards]);

  return (
    <div className={steps.container}>
      {/* Introduction section */}
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>Configuração de Arquivos</h2>
        <p className={steps.stepDescription}>
          Nesta etapa, você configurará as imagens ou vídeos que serão exibidos no seu carrossel do WhatsApp
          e fornecerá a chave de autorização necessária para fazer o upload dos arquivos.
        </p>
      </div>

          <div className={steps.containerCard}>
            <div className={styles.authHeader}>
          <div className={styles.authIconContainer}>
            <FiKey size={24} />
          </div>
          <h3>Autenticação</h3>
            </div>
            
            <Input 
          id="authKey"
          name="authKey"
          label="Chave de Autorização (Router Key)"
          type="password"
          value={authKey}
          onChange={(e) => setAuthKey(e.target.value)}
          placeholder="Digite sua chave de autorização"
          hintMessage="Esta chave é necessária para enviar arquivos e criar templates. Você pode encontrá-la no portal Blip no seu roteador conectado ao Canal WhatsApp."
          hintVariant="simple"
          hintIsCompact={true}
          required
          error="A chave de autorização é obrigatória. Você pode encontrá-la no seu roteador conectado ao Canal WhatsApp, no portal Blip."
            />

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
            </div>
          </div>

        
        {/* Card controls section */}
      <div className={styles.cardsControlSection}>
        <div className={styles.controlHeader}>
          <h3>Configuração dos Cards</h3>
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
            disabled={!isStepValid(1) || loading}
            iconLeft={loading ? null : <FiUpload size={18} />}
            onClick={handleUploadFiles}
          >
            {loading ? 'Processando uploads...' : 'Enviar Arquivos & Continuar'}
          </Button>
        </div>
        
        {!authKey && (
          <div className={styles.validationMessage}>
            <FiInfo size={16} />
            Adicione sua chave de autorização antes de continuar.
          </div>
        )}
        
        {authKey && !allCardsHaveUrls() && (
          <div className={styles.validationMessage}>
            <FiInfo size={16} />
            Adicione URLs para todos os cards antes de continuar.
          </div>
        )}
      </div>
      
      {/* Error and success messages */}
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
      
      {/* Upload summary */}
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>Resumo do upload:</div>
          <ul className={styles.summaryList}>
            {uploadResults.map((result, idx) => (
              <li key={idx} className={styles.summaryItem}>
                Card {idx + 1}: 
                <span className={result.status === 'success' ? styles.successStatus : styles.simulatedStatus}>
                  {result.status === 'success' ? ' Upload bem-sucedido' : ' Simulado para teste'}
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