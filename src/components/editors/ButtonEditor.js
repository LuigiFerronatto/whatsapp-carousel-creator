import React, { useState, useEffect, useCallback } from 'react';
import { FiLink, FiPhone, FiMessageSquare, FiInfo, FiAlertCircle, FiCheckCircle, FiExternalLink, FiLock } from 'react-icons/fi';
import styles from './ButtonEditor.module.css';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import PropTypes from 'prop-types';

/**
 * ButtonEditor - Componente otimizado para editar botões de templates do WhatsApp
 * Com melhor performance e sincronização confiável de botões entre cards
 */
const ButtonEditor = ({ 
  index, 
  buttonIndex, 
  button, 
  updateButtonField, 
  removeButton, 
  totalButtons, 
  showHints = true,
  validationMessage,
  cards,
  numCards,
  syncButtonTypes,
  setFocusedInput
}) => {
  // Estado simplificado para interações de UI
  const [urlTested, setUrlTested] = useState(false);
  const [phoneTested, setPhoneTested] = useState(false);
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  
  // Estado para determinar se o tipo está bloqueado (mais simples)
  const isTypeLocked = numCards > 1 && index > 0;
  
  // Efeito para mostrar aviso de sincronização quando necessário
  useEffect(() => {
    if (index === 0 && numCards > 1 && showSyncWarning) {
      const timer = setTimeout(() => {
        setShowSyncWarning(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [index, numCards, showSyncWarning]);
  
  const handleFocus = useCallback(() => {
    if (typeof setFocusedInput === 'function') {
      setFocusedInput({ cardIndex: index, buttonIndex: buttonIndex });
    }
  }, [setFocusedInput, index, buttonIndex]);

  const handleBlur = useCallback(() => {
    if (typeof setFocusedInput === 'function') {
      setFocusedInput({ cardIndex: null, buttonIndex: null });
    }
  }, [setFocusedInput]);
  
  // Verificação otimizada de URL
  const isValidUrl = useCallback((url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  // Funções de teste simplificadas
  const testUrl = useCallback(() => {
    if (button?.url && isValidUrl(button.url)) {
      window.open(button.url, '_blank', 'noopener,noreferrer');
      setUrlTested(true);
      setTimeout(() => setUrlTested(false), 3000);
    }
  }, [button, isValidUrl]);

  const testPhoneNumber = useCallback(() => {
    if (button?.phoneNumber) {
      window.location.href = `tel:${button.phoneNumber}`;
      setPhoneTested(true);
      setTimeout(() => setPhoneTested(false), 3000);
    }
  }, [button]);
  
  // Manipulador de tipo de botão otimizado para evitar vazamentos de memória
  const handleButtonTypeChange = useCallback((newType) => {
    // Safety check for the button object
    if (!button || typeof updateButtonField !== 'function') {
      console.error("Missing required props in ButtonEditor");
      return;
    }
    
    try {
      // Se estiver bloqueado, mostrar confirmação antes de alterar
      if (isTypeLocked) {
        if (!window.confirm("Alterar o tipo deste botão irá sincronizar todos os botões nesta posição em todos os cards. Deseja continuar?")) {
          return;
        }
      }
      
      // Mostrar aviso de sincronização se for o primeiro card
      if (index === 0 && numCards > 1) {
        setShowSyncWarning(true);
      }
      
      // Atualizar o tipo do botão
      updateButtonField(buttonIndex, 'type', newType);
      
      // Sincronizar com outros cards se necessário
      if (numCards > 1 && typeof syncButtonTypes === 'function' && index === 0) {
        syncButtonTypes(buttonIndex, newType);
      }
    } catch (error) {
      console.error("Error changing button type:", error);
    }
  }, [button, updateButtonField, isTypeLocked, index, numCards, buttonIndex, syncButtonTypes]);
  
  // Manipulador otimizado para remoção de botão
  const handleRemoveButton = useCallback(() => {
    if (typeof removeButton !== 'function') {
      console.error("Missing removeButton function in ButtonEditor");
      return;
    }
    
    try {
      if (numCards > 1 && !window.confirm("Remover este botão irá remover o botão correspondente em todos os cards. Deseja continuar?")) {
        return;
      }
      
      removeButton(buttonIndex);
    } catch (error) {
      console.error("Error removing button:", error);
    }
  }, [removeButton, numCards, buttonIndex]);

  // Safety check - if button is undefined, return empty placeholder
  if (!button) {
    console.warn(`ButtonEditor rendering without valid button data at index ${buttonIndex}`);
    return <div className={styles.buttonContainer}>Button data missing</div>;
  }

  // Configuração de tipos de botão
  const buttonTypes = [
    { 
      value: 'URL', 
      label: 'Abrir Link', 
      icon: <FiLink size={20} />,
      description: 'Leva o usuário para um site externo.'
    },
    { 
      value: 'QUICK_REPLY', 
      label: 'Resposta Rápida', 
      icon: <FiMessageSquare size={20} />,
      description: 'Envia uma mensagem pronta ao clicar.'
    },
    { 
      value: 'PHONE_NUMBER', 
      label: 'Ligação', 
      icon: <FiPhone size={20} />,
      description: 'Inicia uma chamada telefônica instantaneamente.'
    }
  ];

  return (
    <div className={`${styles.buttonContainer} ${validationMessage ? styles.invalidContainer : ''}`}>
      {/* Aviso de Sincronização Simplificado */}
      {showSyncWarning && index === 0 && numCards > 1 && (
        <div className={styles.syncWarning}>
          <FiInfo size={16} />
          <span>
            O WhatsApp exige que todos os cards tenham os mesmos botões na mesma posição.
          </span>
        </div>
      )}
    
      {/* Seletor de Tipo de Botão Otimizado */}
      <div className={styles.buttonTypeSelector}>
        {buttonTypes.map(type => (
          <div 
            key={type.value}
            className={`
              ${styles.typeOption} 
              ${button.type === type.value ? styles.selectedType : ''} 
              ${isTypeLocked && type.value !== button.type ? styles.disabledType : ''}
            `}
            onClick={() => handleButtonTypeChange(type.value)}
            data-testid={`button-type-${type.value}`}
          >
            <div className={styles.typeIconWrapper}>
              {type.icon}
              {isTypeLocked && index > 0 && (
                <div className={styles.lockIndicator}>
                  <FiLock size={12} />
                </div>
              )}
            </div>
            <span className={styles.typeLabel}>{type.label}</span>
          </div>
        ))}
      </div>
      
      {/* Descrição simplificada do tipo */}
      {showHints && (
        <div className={styles.typeDescription}>
          {buttonTypes.find(t => t.value === button.type)?.description}
        </div>
      )}

      {/* Aviso simplificado quando bloqueado */}
      {isTypeLocked && index > 0 && showHints && (
        <div className={styles.syncNotice}>
          <FiInfo size={14} />
          <span>
            Tipo de botão sincronizado com o primeiro card.
          </span>
        </div>
      )}

      {/* Campo de texto do botão - simplificado e otimizado */}
      <Input
        id={`button-${buttonIndex}-text-${index}`}
        name="ButtonText"
        label="Texto do Botão"
        value={button.text || ''}
        onChange={(e) => updateButtonField(buttonIndex, 'text', e.target.value)}
        placeholder="Ex: Saiba mais, Comprar agora"
        required
        maxLength={25}
        error={false}
        hintMessage={showHints ? "Máximo de 25 caracteres." : ""}
        allowFormatting={false}
        showCharCounter
        hintIsCompact={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-testid={`button-text-input-${buttonIndex}`}
      />
      
      {/* Campo URL - otimizado */}
      {button.type === 'URL' && (
        <Input
          id={`button-${buttonIndex}-url-${index}`}
          name={`button-${buttonIndex}-url`}
          type="url"
          label="Link de Destino"
          value={button.url || ''}
          onChange={(e) => updateButtonField(buttonIndex, 'url', e.target.value)}
          placeholder="https://example.com/page"
          required
          error={button.url && !isValidUrl(button.url) ? "URL inválida. Inclua 'https://' ou 'http://'" : ""}
          variant="url"
          validateOnChange
          onFocus={handleFocus}
          onBlur={handleBlur}
          rightElement={button.url && (
            <Button 
              type="button"
              className={styles.testActionButton}
              onClick={testUrl}
              disabled={!isValidUrl(button.url)}
              title={isValidUrl(button.url) ? "Testar este URL" : "Formato de URL inválido"}
              data-testid={`test-url-button-${buttonIndex}`}
            >
              {urlTested ? (
                <>
                  <FiCheckCircle size={14} />
                  <span>Aberto</span>
                </>
              ) : (
                <>
                  <FiExternalLink size={14} />
                  <span>Testar</span>
                </>
              )}
            </Button>
          )}
          icon={button.url && !isValidUrl(button.url) ? <FiAlertCircle size={14}/> : null}
          hintMessage={showHints}
          hintTitle="Links devem:"
          hintList={[
            "Incluir 'https://' no início",
            "Usar HTTPS quando possível",
            "Ser testados antes de salvar"
          ]}
          hintVariant="simple"
          hintIsCompact={true}
          data-testid={`button-url-input-${buttonIndex}`}
        />
      )}
      
      {/* Campo de Payload de Resposta Rápida - simplificado */}
      {button.type === 'QUICK_REPLY' && (
        <Input
          id={`button-${buttonIndex}-payload-${index}`}
          type="text"
          name="OptinalPayload"
          label="Payload"
          hintMessage="Texto que será enviado ao sistema quando o botão for clicado."
          hintVariant="simple"
          value={button.payload || ''}
          onChange={(e) => updateButtonField(buttonIndex, 'payload', e.target.value)}
          placeholder="Deixe vazio para usar o texto do botão"
          hintIsCompact={true}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={`button-payload-input-${buttonIndex}`}
        />
      )}
      
      {/* Campo de Número de Telefone - simplificado */}
      {button.type === 'PHONE_NUMBER' && (
        <Input
          id={`button-${buttonIndex}-phone-${index}`}
          name={`button-${buttonIndex}-phone`}
          type="tel"
          label="Número de Telefone"
          value={button.phoneNumber || ''}
          onChange={(e) => updateButtonField(buttonIndex, 'phoneNumber', e.target.value)}
          placeholder="5521999999999"
          required
          variant="phoneNumber"
          validateOnChange
          onFocus={handleFocus}
          onBlur={handleBlur}
          rightElement={button.phoneNumber && (
            <Button
              type="button"
              className={styles.testActionButton}
              onClick={testPhoneNumber}
              title="Testar este número"
              size="small"
              variant='outline'
              data-testid={`test-phone-button-${buttonIndex}`}
            >
              {phoneTested ? (
                <>
                  <FiCheckCircle size={14} />
                  <span>Testado</span>
                </>
              ) : (
                <>
                  <FiPhone size={14} />
                  <span>Testar</span>
                </>
              )}
            </Button>
          )}
          hintMessage={showHints}
          hintTitle="Formato correto:"
          hintList={[
            "Inclua o código do país (Brasil: 55)",
            "Não use espaços ou símbolos"
          ]}
          hintVariant="simple"
          hintIsCompact={true}
          data-testid={`button-phone-input-${buttonIndex}`}
        />
      )}

      {/* Botão de remover - simplificado */}
      {totalButtons > 1 && (
        <div className={styles.buttonActions}>
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemoveButton}
            data-testid={`remove-button-${buttonIndex}`}
          >
            {numCards > 1 ? "Remover botão de todos os cards" : "Remover botão"}
          </button>
        </div>
      )}
      
      {/* Mensagem de Validação - simplificada */}
      {validationMessage && (
        <div className={styles.validationMessage}>
          <FiAlertCircle className={styles.validationIcon} />
          {validationMessage}
        </div>
      )}
    </div>
  );
};

ButtonEditor.propTypes = {
  index: PropTypes.number.isRequired,
  buttonIndex: PropTypes.number.isRequired,
  button: PropTypes.object.isRequired,
  updateButtonField: PropTypes.func.isRequired,
  removeButton: PropTypes.func.isRequired,
  totalButtons: PropTypes.number.isRequired,
  showHints: PropTypes.bool,
  validationMessage: PropTypes.string,
  cards: PropTypes.array,
  numCards: PropTypes.number,
  syncButtonTypes: PropTypes.func,
  setFocusedInput: PropTypes.func
};

export default React.memo(ButtonEditor);