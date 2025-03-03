// components/steps/StepOne.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import AlertMessage from '../common/AlertMessage';
import Button from '../common/Button';
import { FiUpload, FiPlus, FiMinus, FiKey, FiArrowDown, FiSave, FiInfo } from 'react-icons/fi';
import styles from './StepOne.module.css';

/**
 * StepOne - Etapa inicial para configuração de arquivos
 * Versão aprimorada com melhor experiência do usuário
 * 
 * @param {Object} props Propriedades do componente
 * @returns {JSX.Element} Componente StepOne
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
  // Estados locais
  const [authKeyVisible, setAuthKeyVisible] = useState(false);
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [rememberKey, setRememberKey] = useState(() => {
    return localStorage.getItem('remember_auth_key') === 'true';
  });
  const [showTips, setShowTips] = useState(true);
  
  // Refs
  const uploadSectionRef = useRef(null);
  
  // Efeito para gerenciar a chave de autorização no localStorage
  useEffect(() => {
    if (rememberKey && authKey) {
      localStorage.setItem('auth_key', authKey);
      localStorage.setItem('remember_auth_key', 'true');
    } else if (!rememberKey) {
      localStorage.removeItem('auth_key');
      localStorage.setItem('remember_auth_key', 'false');
    }
  }, [rememberKey, authKey]);
  
  // Carregar chave de autorização do localStorage
  useEffect(() => {
    if (rememberKey && !authKey) {
      const savedKey = localStorage.getItem('auth_key');
      if (savedKey) {
        setAuthKey(savedKey);
      }
    }
  }, [rememberKey, authKey, setAuthKey]);
  
  // Alternar visibilidade da chave de autorização
  const toggleAuthKeyVisibility = useCallback(() => {
    setAuthKeyVisible(!authKeyVisible);
  }, [authKeyVisible]);
  
  // Rolar para a seção de upload
  const scrollToUploadSection = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  // Salvar antes de fazer upload
  const handleSaveBeforeUpload = useCallback(() => {
    saveDraftManually();
    setSavedBeforeUpload(true);
    
    setTimeout(() => {
      setSavedBeforeUpload(false);
    }, 3000);
  }, [saveDraftManually]);
  
  // Verificar se todos os cards têm URLs válidas
  const allCardsHaveUrls = useCallback(() => {
    return cards.slice(0, numCards).every(card => card.fileUrl?.trim());
  }, [cards, numCards]);
  
  // Renderizar seção de autenticação
  const renderAuthSection = () => (
    <div className={styles.authSection}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authIconContainer}>
            <FiKey size={24} />
          </div>
          <h3 className={styles.authTitle}>Autenticação</h3>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Chave de Autorização (Router Key)</label>
          <div className={styles.authInputContainer}>
            <input 
              type={authKeyVisible ? "text" : "password"}
              className={styles.input}
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="Key=xxxxxxxxx"
            />
            <button 
              className={styles.visibilityToggle}
              onClick={toggleAuthKeyVisibility}
              type="button"
              aria-label={authKeyVisible ? "Ocultar chave" : "Mostrar chave"}
            >
              {authKeyVisible ? "Ocultar" : "Mostrar"}
            </button>
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
            <p className={styles.helpText}>
              Esta chave é necessária para enviar arquivos e criar templates.
              Você pode encontrá-la no portal da Blip.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renderizar controles de cards
  const renderCardControls = () => (
    <div className={styles.cardsControlSection}>
      <div className={styles.controlHeader}>
        <h3 className={styles.controlTitle}>Configuração de Cards</h3>
        <div className={styles.cardCounter}>
          <span className={styles.cardCountLabel}>Número de cards:</span>
          <div className={styles.buttonGroup}>
            <button 
              onClick={handleRemoveCard}
              disabled={numCards <= 2}
              className={styles.controlButton}
              aria-label="Remover card"
            >
              <FiMinus size={18} />
            </button>
            <span className={styles.cardCount}>{numCards}</span>
            <button 
              onClick={handleAddCard}
              disabled={numCards >= 10}
              className={styles.controlButton}
              aria-label="Adicionar card"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.cardControlOptions}>
        <p className={styles.cardControlHelp}>
          Um carousel precisa de pelo menos 2 e no máximo 10 cards. Cada card terá uma imagem ou vídeo e botões interativos.
        </p>
        
        <div className={styles.cardTipsContainer}>
          <button 
            className={styles.tipsToggle}
            onClick={() => setShowTips(!showTips)}
          >
            {showTips ? "Ocultar dicas" : "Mostrar dicas"}
          </button>
          
          {showTips && (
            <div className={styles.cardTips}>
              <h4>Melhores práticas para imagens de carousel:</h4>
              <ul>
                <li>Tamanho recomendado: 800×418 pixels</li>
                <li>Use as mesmas dimensões para todas as imagens para exibição consistente</li>
                <li>Mantenha os arquivos com menos de 5MB para carregamento rápido</li>
                <li>Para vídeos, mantenha a duração abaixo de 60 segundos</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <button 
        className={styles.jumpToCardsButton}
        onClick={scrollToUploadSection}
        type="button"
      >
        Ver todos os cards <FiArrowDown size={14} />
      </button>
    </div>
  );
  
  // Renderizar a grade de cards para upload
  const renderCardsGrid = () => (
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
  );
  
  // Renderizar botões de ação
  const renderActionButtons = () => (
    <div className={styles.actionSection}>
      <div className={styles.actionButtons}>
        <Button 
          variant="outline"
          color="content"
          size="medium"
          onClick={handleSaveBeforeUpload}
          iconLeft={<FiSave size={18} />}
          className={styles.saveButton}
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
          className={styles.uploadButton}
        >
          {loading ? 'Processando uploads...' : 'Enviar Arquivos e Continuar'}
        </Button>
      </div>
      
      {!authKey && (
        <p className={styles.validationMessage}>
          Adicione sua chave de autorização antes de continuar.
        </p>
      )}
      
      {authKey && !allCardsHaveUrls() && (
        <p className={styles.validationMessage}>
          Adicione URLs para todos os cards antes de continuar.
        </p>
      )}
    </div>
  );
  
  // Renderizar resumo de upload
  const renderUploadSummary = () => (
    uploadResults.length > 0 && (
      <div className={styles.uploadSummary}>
        <div className={styles.summaryTitle}>Resumo do upload:</div>
        <ul className={styles.summaryList}>
          {uploadResults.map((result, idx) => (
            <li key={idx} className={styles.summaryItem}>
              Card {idx + 1}: 
              <span className={result.status === 'success' ? styles.successStatus : styles.simulatedStatus}>
                {result.status === 'success' ? ' Upload realizado com sucesso' : ' Simulado para testes'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  );

  return (
    <div className={styles.container}>
      <div className={styles.introSection}>
        <h2 className={styles.stepTitle}>Configuração de Arquivos</h2>
        <p className={styles.stepDescription}>
          Nesta etapa, você vai configurar as imagens ou vídeos que serão exibidos no seu carousel
          do WhatsApp e fornecer a chave de autorização necessária para upload dos arquivos.
        </p>
      </div>

      {renderAuthSection()}
      {renderCardControls()}
      {renderCardsGrid()}
      {renderActionButtons()}
      
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
      
      {renderUploadSummary()}
    </div>
  );
};

export default StepOne;