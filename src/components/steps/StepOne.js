// components/steps/StepOne.js
import React, { useState, useRef } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import StatusMessage from '../common/StatusMessage';
import Button from '../common/Button';
import { FiUpload, FiPlus, FiMinus, FiKey, FiArrowDown } from 'react-icons/fi';
import styles from './StepOne.module.css';

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
  isStepValid 
}) => {
  const [authKeyVisible, setAuthKeyVisible] = useState(false);
  const uploadSectionRef = useRef(null);

  // Função para mostrar/esconder a chave de autorização
  const toggleAuthKeyVisibility = () => {
    setAuthKeyVisible(!authKeyVisible);
  };

  // Função para rolar até a seção de cards - agora utilizada no botão
  const scrollToUploadSection = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.introSection}>
        <h2 className={styles.stepTitle}>Passo 1: Configurar Arquivos</h2>
        <p className={styles.stepDescription}>
          Neste passo, você vai configurar as imagens ou vídeos que serão exibidos no carrossel do WhatsApp e 
          fornecer a chave de autorização necessária para fazer upload dos arquivos.
        </p>
      </div>

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
                aria-label={authKeyVisible ? "Esconder chave" : "Mostrar chave"}
              >
                {authKeyVisible ? "Esconder" : "Mostrar"}
              </button>
            </div>
            <p className={styles.helpText}>
              Esta chave é necessária para o envio dos arquivos e criação do template.
              Você pode encontrá-la no portal do Blip.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.cardsControlSection}>
        <div className={styles.controlHeader}>
          <h3 className={styles.controlTitle}>Configuração de Cards</h3>
          <div className={styles.cardCounter}>
            <span className={styles.cardCountLabel}>Quantidade de cards:</span>
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
        
        <p className={styles.cardControlHelp}>
          Um carrossel precisa ter no mínimo 2 e no máximo 10 cards. Cada card terá uma imagem ou vídeo e botões interativos.
        </p>
        
        {/* Botão para navegação para a seção de cards - nova adição */}
        <button 
          className={styles.jumpToCardsButton}
          onClick={scrollToUploadSection}
          type="button"
        >
          Ver cards <FiArrowDown size={14} />
        </button>
      </div>

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
      
      <div className={styles.actionSection}>
        <Button 
          variant="solid"
          color="primary"
          size="large"
          loading={loading}
          disabled={!isStepValid(1) || loading}
          iconLeft={loading ? null : <FiUpload size={18} />}
          onClick={handleUploadFiles}
        >
          {loading ? 'Processando uploads...' : 'Enviar Arquivos e Continuar'}
        </Button>
        
        {!isStepValid(1) && !loading && (
          <p className={styles.validationMessage}>
            Preencha a chave de autorização e adicione URLs para todos os cards antes de continuar.
          </p>
        )}
      </div>
      
      <StatusMessage error={error} success={success} />
      
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>Resumo dos uploads:</div>
          <ul className={styles.summaryList}>
            {uploadResults.map((result, idx) => (
              <li key={idx} className={styles.summaryItem}>
                Card {idx + 1}: 
                <span className={result.status === 'success' ? styles.successStatus : styles.simulatedStatus}>
                  {result.status === 'success' ? ' Enviado com sucesso' : ' Simulado para testes'}
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