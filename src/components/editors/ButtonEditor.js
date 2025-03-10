// components/editors/ButtonEditor.js
import React, { useState, useEffect } from 'react';
import { FiLink, FiPhone, FiMessageSquare, FiInfo, FiAlertCircle, FiCheckCircle, FiExternalLink, FiLock, FiUnlock } from 'react-icons/fi';
import styles from './ButtonEditor.module.css';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import PropTypes from 'prop-types'

/**
 * ButtonEditor - Componente aprimorado para editar botões de templates do WhatsApp
 * Agora com sincronização de tipo de botão em todos os cards
 * 
 * @param {Object} props Propriedades do componente
 * @param {number} props.index Índice do card
 * @param {number} props.buttonIndex Índice do botão dentro do card
 * @param {Object} props.button Dados do botão
 * @param {Function} props.updateButtonField Função para atualizar campos do botão
 * @param {Function} props.removeButton Função para remover o botão
 * @param {number} props.totalButtons Total de botões no card
 * @param {boolean} props.showHints Se deve mostrar dicas úteis
 * @param {string} props.validationMessage Mensagem de erro de validação, se houver
 * @param {Array} props.cards Todos os cards do carrossel
 * @param {number} props.numCards Número de cards ativos
 * @param {Function} props.syncButtonTypes Função para sincronizar tipos de botões em todos os cards
 * @returns {JSX.Element} Componente ButtonEditor
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
  // Estado para interações de UI
  const [urlTested, setUrlTested] = useState(false);
  const [phoneTested, setPhoneTested] = useState(false);
  const [isTypeLocked, setIsTypeLocked] = useState(true);
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  
  // Efeito para detectar se este é o primeiro card com este índice de botão
  // Se não for, bloqueamos a seleção do tipo de botão (deve seguir o primeiro card)
  useEffect(() => {
    // Só bloqueia se houver múltiplos cards e este não for o primeiro card
    const shouldLock = numCards > 1 && index > 0;
    setIsTypeLocked(shouldLock);
  }, [numCards, index]);
  
  const handleFocus = () => {
    setFocusedInput?.({ cardIndex: index, buttonIndex: buttonIndex });
  };

  const handleBlur = () => {
    setFocusedInput?.({ cardIndex: null, buttonIndex: null });
  };
  
  // Verificação de URL válida com protocolo adequado
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Testar link de URL com feedback visual
  const testUrl = () => {
    if (button.url && isValidUrl(button.url)) {
      window.open(button.url, '_blank', 'noopener,noreferrer');
      setUrlTested(true);
      setTimeout(() => setUrlTested(false), 3000);
    }
  };

  // Testar ação de clique no número de telefone
  const testPhoneNumber = () => {
    if (button.phoneNumber) {
      window.location.href = `tel:${button.phoneNumber}`;
      setPhoneTested(true);
      setTimeout(() => setPhoneTested(false), 3000);
    }
  };
  
  // Lidar com mudança de tipo de botão com sincronização
  const handleButtonTypeChange = (newType) => {
    if (isTypeLocked && !window.confirm("Alterar o tipo deste botão irá sincronizar todos os botões nesta posição em todos os cards. Deseja continuar?")) {
      return;
    }
    
    // Se for o primeiro card e houver múltiplos cards, mostrar aviso sobre sincronização
    if (index === 0 && numCards > 1 && !showSyncWarning) {
      setShowSyncWarning(true);
      setTimeout(() => setShowSyncWarning(false), 5000);
    }
    
    // Verificar se precisamos sincronizar em todos os cards
    if (numCards > 1) {
      // Primeiro atualiza este botão
      updateButtonField(buttonIndex, 'type', newType);
      
      // Depois sincroniza com todos os outros cards
      if (syncButtonTypes) {
        syncButtonTypes(buttonIndex, newType);
      }
    } else {
      // Apenas atualiza este botão
      updateButtonField(buttonIndex, 'type', newType);
    }
  };
  
  // Lidar com remoção de botão com sincronização
  const handleRemoveButton = () => {
    if (numCards > 1 && !window.confirm("Remover este botão irá remover o botão correspondente em todos os cards. Deseja continuar?")) {
      return;
    }
    
    removeButton(buttonIndex);
  };

  // Configuração de tipos de botão com ícones e descrições
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
      {/* Aviso de Sincronização do WhatsApp */}
      {showSyncWarning && index === 0 && numCards > 1 && (
        <div className={styles.syncWarning}>
          <FiInfo size={16} />
          <span>
            O WhatsApp exige que todos os cards tenham os mesmos botões na mesma posição. Se alterar este botão, todas as outras versões serão ajustadas automaticamente.
          </span>
        </div>
      )}
    
      {/* Seletor de Tipo de Botão */}
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
      
      {/* Descrição do Tipo */}
      {showHints && (
        <div className={styles.typeDescription}>
          {buttonTypes.find(t => t.value === button.type)?.description}
        </div>
      )}

      {/* Aviso de Requisito do WhatsApp */}
      {isTypeLocked && index > 0 && showHints && (
        <div className={styles.syncNotice}>
          <FiInfo size={14} />
          <span>
            O tipo deste botão segue a configuração do primeiro card, conforme as regras do WhatsApp.
          </span>
        </div>
      )}

      <Input
        id="buttonText"
        name="ButtonText"
        label="Texto do Botão"
        value={button.text || ''}
        onChange={(e) => updateButtonField(buttonIndex, 'text', e.target.value)}
        placeholder="Exemplos: Saiba mais, Comprar agora, etc."
        required
        minLength={1}
        maxLength={25}
        error={false}
        hintMessage={showHints ? "Texto exibido no botão. Máximo de 25 caracteres." : ""}
        allowFormatting={false}
        textFormatting={false} // Habilita a barra de formatação
        textFormattingCompact={false} // Opcional: tamanho normal
        textFormattingDarkMode={false} // Opcional: tema claro
        showCharCounter
        hintIsCompact={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      {button.type === 'URL' && (
        <Input
          id={`button-${buttonIndex}-url`}
          name={`button-${buttonIndex}-url`}
          type="url"
          label="Link de Destino"
          value={button.url || ''}
          onChange={(e) => updateButtonField(buttonIndex, 'url', e.target.value)}
          placeholder="https://example.com/page"
          required
          error={button.url && !isValidUrl(button.url) ? "URL inválida. Certifique-se de incluir 'https://' ou 'http://'" : ""}
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
          hintTitle="Como criar um bom link:"
          hintList={[
            "Sempre use HTTPS quando possível (mais seguro)",
            "A URL completa deve incluir 'https://' no início",
            "Evite encurtadores de URL não confiáveis",
            "Teste o link antes de salvar",
            <React.Fragment>
              <strong>Exemplos válidos:</strong><br />
              <code>https://www.example.com</code><br />
              <code>https://example.com/product?id=123</code>
            </React.Fragment>
          ]}
          hintVariant="simple"
          hintIsCompact={true}
        />
      )}
      
      {/* Campo de Payload de Resposta Rápida */}
      {button.type === 'QUICK_REPLY' && (
        <div className={styles.formGroup}>
          <Input
            type="text"
            name="OptinalPayload"
            label="Payload"
            hintMessage="O payload é o texto que será enviado ao seu sistema quando o usuário clicar no botão."
            hintVariant="simple"
            value={button.payload || ''}
            onChange={(e) => updateButtonField(buttonIndex, 'payload', e.target.value)}
            placeholder="Deixe vazio para usar o texto do botão como payload"
            hintIsCompact={true}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      )}
      
      {/* Campo de Número de Telefone */}
      {button.type === 'PHONE_NUMBER' && (
    <Input
    id={`button-${buttonIndex}-phone`}
    name={`button-${buttonIndex}-phone`}
    type="tel"
    label="Número de Telefone"
    value={button.phoneNumber || ''}
    onChange={(e) => {
      // O componente Input já envia apenas os dígitos no e.target.value
      // Não precisamos fazer nenhum processamento adicional aqui
      updateButtonField(buttonIndex, 'phoneNumber', e.target.value);
    }}
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
    hintTitle="Formato do número de telefone:"
    hintList={[
      "Inclua o código do país (Brasil: 55)",
      "Inclua o código de área sem o zero",
      "Não use espaços, parênteses ou hífens"
    ]}
    hintVariant="simple"
    hintIsCompact={true}
  />
)}

      {totalButtons > 1 && (
        <div className={styles.buttonActions}>
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemoveButton}
          >
            {numCards > 1 ? "Remover Botão em Todos os Cards" : "Remover Botão"}
          </button>
        </div>
      )}
      
      {/* Mensagem de Validação */}
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
  cards: PropTypes.array.isRequired,
  numCards: PropTypes.number.isRequired,
  syncButtonTypes: PropTypes.func.isRequired,
  setFocusedInput: PropTypes.func.isRequired
};

export default ButtonEditor;
