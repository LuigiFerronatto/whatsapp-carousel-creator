// hooks/useWhatsAppTemplate.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAlertSafe } from './useAlertSafe';
import { validateTemplate, validatePhoneNumber } from '../services/validation/validationService';
import { uploadFiles, createTemplate, sendTemplateMessage } from '../services/api/apiService';
import { saveDraft, loadDraft, clearDraft } from '../services/storage/localStorageService';
import { handleApiError } from '../utils/errorHandler';

export const useWhatsAppTemplate = () => {
  // Alert hook
  const alert = useAlertSafe();
  
  // Refs para controle
  const draftLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  
  // Estados
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  // Estados do template
  const [authKey, setAuthKey] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('pt_BR');
  const [bodyText, setBodyText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasTriedToAdvance, setHasTriedToAdvance] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Estados dos cards
  const [numCards, setNumCards] = useState(2);
  const [cards, setCards] = useState([
    createEmptyCard(),
    createEmptyCard()
  ]);
  
  // Estados de resultados
  const [uploadResults, setUploadResults] = useState([]);
  const [finalJson, setFinalJson] = useState({});

  // Função para criar um card vazio
  function createEmptyCard() {
    return {
      fileUrl: '',
      fileType: 'image',
      fileHandle: '',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: '', payload: '' }]
    };
  }

  // Carregar rascunho apenas uma vez na inicialização
  useEffect(() => {
    // Evitar carregamentos múltiplos
    if (draftLoadedRef.current) return;
    
    const loadSavedData = () => {
      try {
        const savedDraft = loadDraft();
        if (!savedDraft) return;
        
        // Aplicar dados salvos
        if (savedDraft.templateName) setTemplateName(savedDraft.templateName);
        if (savedDraft.language) setLanguage(savedDraft.language);
        if (savedDraft.bodyText) setBodyText(savedDraft.bodyText);
        if (savedDraft.authKey) setAuthKey(savedDraft.authKey);
        
        // Aplicar cards salvos se existirem e forem válidos
        if (savedDraft.cards && savedDraft.cards.length >= 2) {
          // Garantir que os fileHandles estejam preservados
          const processedCards = savedDraft.cards.map(card => ({
            ...card,
            fileHandle: card.fileHandle || '',  // Garantir que fileHandle nunca seja undefined
            buttons: card.buttons || [{ type: 'QUICK_REPLY', text: '', payload: '' }]
          }));
          
          setCards(processedCards);
          setNumCards(processedCards.length);
          
          console.log('Cards carregados do rascunho:', processedCards.length);
          console.log('Cards com fileHandles:', processedCards.filter(c => c.fileHandle).length);
        }
        
        // Definir último salvamento
        if (savedDraft.lastSavedTime) {
          const savedTime = typeof savedDraft.lastSavedTime === 'string' 
            ? new Date(savedDraft.lastSavedTime)
            : new Date(savedDraft.lastSavedTime);
            
          setLastSavedTime(savedTime);
        }
        
        // Mostrar confirmação ao usuário
        setTimeout(() => {
          if (alert && typeof alert.info === 'function') {
            alert.info('Rascunho anterior carregado com sucesso!', {
              position: 'top-right',
              autoCloseTime: 3000
            });
          }
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    };
    
    // Usar setTimeout para garantir que execute após a renderização inicial
    setTimeout(loadSavedData, 0);
    draftLoadedRef.current = true;
  }, [alert]);

  // Salvar o estado atual no localStorage (apenas quando chamado explicitamente)
  const saveCurrentState = useCallback(() => {
    // Criar objeto com estado atual
    const state = {
      templateName,
      language,
      bodyText,
      cards,
      authKey,
      numCards,
      step // Salvar o passo atual
    };
    
    // Chamar saveDraft e obter resultado
    const saveSuccess = saveDraft(state);
    
    if (saveSuccess) {
      // Atualizar estado de UI
      const currentTime = new Date();
      setLastSavedTime(currentTime);
      setUnsavedChanges(false);
      
      console.log('Rascunho salvo com sucesso em', currentTime.toLocaleString());
      return true;
    }
    
    console.error('Falha ao salvar rascunho');
    return false;
  }, [templateName, language, bodyText, cards, authKey, numCards, step]);

  // Monitorar mudança de step para garantir que os fileHandles sejam preservados
  useEffect(() => {
    if (step === 2 && cards.some(card => card.fileHandle)) {
      // Salvar o estado quando avançar para o step 2 para garantir que os fileHandles sejam preservados
      saveCurrentState();
      console.log('Estado salvo ao avançar para step 2, fileHandles preservados');
    }
  }, [step, cards, saveCurrentState]);

  // Função para exibir erros de validação
  const showValidationErrors = useCallback((errorMessages) => {
    if (!errorMessages || errorMessages.length === 0) return;
    
    // Usar setTimeout para evitar alertas durante a renderização
    setTimeout(() => {
      if (alert && typeof alert.error === 'function') {
        alert.error(`Problemas de validação encontrados:\n${errorMessages.join('\n')}`, {
          position: 'top-center',
          autoCloseTime: 7000
        });
      }
    }, 0);
  }, [alert]);
  
  // Validação do primeiro passo
  const validateStepOne = useCallback((triggerAlerts = false) => {
    // Não validar automaticamente se o usuário ainda não tentou avançar
    if (!hasTriedToAdvance && !triggerAlerts) {
      return true;
    }
  
    const errors = {};
    const errorMessages = [];
  
    // Validar a chave de autorização
    if (!authKey) {
      errors.authKey = 'A chave de autorização (Router Key) é obrigatória';
      errorMessages.push('Chave de autorização (Router Key) é obrigatória');
    }
  
    // Validar URLs dos arquivos para cada card
    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.fileUrl) {
        errors[`card_${index}_fileUrl`] = `URL do arquivo não informada para o card ${index + 1}`;
        errorMessages.push(`Card ${index + 1}: URL do arquivo não informada`);
      }
    });
  
    // Atualizar erros de validação no estado
    setValidationErrors(errors);
  
    // Disparar alertas apenas se solicitado
    if (triggerAlerts && errorMessages.length > 0) {
      showValidationErrors(errorMessages);
    }
  
    return errorMessages.length === 0;
  }, [authKey, cards, numCards, hasTriedToAdvance, showValidationErrors]);
  
  // Validação do segundo passo
  const validateStepTwo = useCallback(() => {
    const errors = {};
    const errorMessages = [];
    
    // Validar nome do template
    if (!templateName) {
      errors.templateName = 'Nome do template é obrigatório';
      errorMessages.push('Nome do template é obrigatório');
    } else if (templateName.length < 3) {
      errors.templateName = 'Nome do template deve ter pelo menos 3 caracteres';
      errorMessages.push('Nome do template deve ter pelo menos 3 caracteres');
    }
    
    // Validar texto do corpo
    if (!bodyText) {
      errors.bodyText = 'Texto do corpo da mensagem é obrigatório';
      errorMessages.push('Texto do corpo da mensagem é obrigatório');
    } else if (bodyText.length > 1024) {
      errors.bodyText = `Texto do corpo excede o limite de 1024 caracteres. Atual: ${bodyText.length}`;
      errorMessages.push(`Texto do corpo excede o limite de 1024 caracteres (${bodyText.length})`);
    }
    
    // Validar cards
    cards.slice(0, numCards).forEach((card, index) => {
      // Validar texto do card
      if (!card.bodyText) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} é obrigatório`;
        errorMessages.push(`Card ${index + 1}: texto é obrigatório`);
      } else if (card.bodyText.length > 160) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} excede o limite de 160 caracteres`;
        errorMessages.push(`Card ${index + 1}: texto excede limite de 160 caracteres`);
      }
      
      // Validar botões
      if (!card.buttons || card.buttons.length === 0) {
        errors[`card_${index}_buttons`] = `Adicione pelo menos um botão para o card ${index + 1}`;
        errorMessages.push(`Card ${index + 1}: adicione pelo menos um botão`);
      } else {
        card.buttons.forEach((button, btnIndex) => {
          // Validar texto do botão
          if (!button.text) {
            errors[`card_${index}_button_${btnIndex}_text`] = `Texto do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: texto é obrigatório`);
          }
          
          // Validar URL do botão
          if (button.type === 'URL' && !button.url) {
            errors[`card_${index}_button_${btnIndex}_url`] = `URL do botão ${btnIndex + 1} no card ${index + 1} é obrigatória`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: URL é obrigatória`);
          }
          
          // Validar número de telefone do botão
          if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
            errors[`card_${index}_button_${btnIndex}_phoneNumber`] = `Número de telefone do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: número de telefone é obrigatório`);
          }
        });
      }
    });
    
    // Atualizar erros de validação
    setValidationErrors(errors);
    
    return errorMessages.length > 0 ? errorMessages : [];
  }, [templateName, bodyText, cards, numCards]);
  
  // Validação do terceiro passo
  const validateStepThree = useCallback(() => {
    const errors = {};
    const errorMessages = [];
    
    // Validar número de telefone
    if (!phoneNumber) {
      errors.phoneNumber = 'Número de telefone é obrigatório para enviar o template';
      errorMessages.push('Número de telefone é obrigatório');
    } else {
      try {
        validatePhoneNumber(phoneNumber);
      } catch (err) {
        errors.phoneNumber = err.message;
        errorMessages.push(err.message);
      }
    }
    
    // Atualizar erros de validação
    setValidationErrors(errors);
    
    return errorMessages.length > 0 ? errorMessages : [];
  }, [phoneNumber]);
  
  // Verificar se o passo atual é válido
  const isStepValid = useCallback((currentStep, triggerAlerts = false) => {
    let errors = [];
    
    switch(currentStep) {
      case 1:
        return validateStepOne(triggerAlerts);
      case 2:
        errors = validateStepTwo();
        break;
      case 3:
        errors = validateStepThree();
        break;
      default:
        errors = [];
    }
    
    // Mostrar alertas apenas se solicitado
    if (triggerAlerts && errors.length > 0) {
      showValidationErrors(errors);
    }
    
    return errors.length === 0;
  }, [validateStepOne, validateStepTwo, validateStepThree, showValidationErrors]);
  
  // Verificar a consistência dos botões entre todos os cards
  const checkButtonConsistency = useCallback(() => {
    const activeCards = cards.slice(0, numCards);
    
    // Consistente se houver apenas um card
    if (activeCards.length <= 1) {
      return { 
        isConsistent: true,
        message: "Consistente: Apenas um card no carrossel."
      };
    }
    
    // Coletar informações do primeiro card como referência
    const referenceButtons = activeCards[0].buttons;
    const referenceCount = referenceButtons.length;
    const referenceTypes = referenceButtons.map(button => button.type);
    
    // Verificar consistência em todos os cards
    let allSameCount = true;
    let allSameTypes = true;
    let inconsistentCards = [];
    
    activeCards.forEach((card, index) => {
      if (index === 0) return; // Pular o primeiro card (referência)
      
      // Verificar quantidade de botões
      if (card.buttons.length !== referenceCount) {
        allSameCount = false;
        inconsistentCards.push({
          cardIndex: index,
          issue: `Quantidade diferente de botões: ${card.buttons.length} vs ${referenceCount}`
        });
      }
      
      // Verificar tipos de botões se a quantidade for a mesma
      if (card.buttons.length === referenceCount) {
        for (let i = 0; i < referenceCount; i++) {
          if (card.buttons[i].type !== referenceTypes[i]) {
            allSameTypes = false;
            inconsistentCards.push({
              cardIndex: index,
              buttonIndex: i,
              issue: `Tipo de botão diferente: ${card.buttons[i].type} vs ${referenceTypes[i]}`
            });
          }
        }
      }
    });
    
    // Determinar status geral
    const isConsistent = allSameCount && allSameTypes;
    
    // Formatar mensagem detalhada
    let message = isConsistent 
      ? "Consistente: Todos os cards têm a mesma quantidade e tipos de botões."
      : "Inconsistente: ";
      
    if (!allSameCount) {
      message += "Alguns cards têm números diferentes de botões. ";
    }
    
    if (!allSameTypes) {
      message += "Alguns cards têm tipos diferentes de botões. ";
    }
    
    // Incluir informações sobre padronização
    if (!isConsistent) {
      // Encontrar o card com mais botões
      const maxButtonCount = Math.max(...activeCards.map(card => card.buttons.length));
      const templateCard = activeCards.find(card => card.buttons.length === maxButtonCount);
      const templateIndex = activeCards.indexOf(templateCard);
      
      message += `A padronização usará como modelo o Card ${templateIndex + 1} com ${maxButtonCount} botões.`;
    }
    
    return {
      isConsistent,
      message,
      inconsistentCards,
      allSameCount,
      allSameTypes
    };
  }, [cards, numCards]);

  // Padronizar botões entre todos os cards
  const standardizeButtons = useCallback(() => {
    const activeCards = cards.slice(0, numCards);
    
    // Se tiver apenas um card, não precisa padronizar
    if (activeCards.length <= 1) {
      return cards;
    }
    
    // Encontrar o card com mais botões para usar como modelo
    const maxButtonCount = Math.max(...activeCards.map(card => card.buttons.length));
    const templateCard = activeCards.find(card => card.buttons.length === maxButtonCount);
    const templateButtons = templateCard.buttons;
    
    // Criar cópia dos cards para modificação
    const standardizedCards = [...cards];
    
    // Padronizar todos os cards ativos
    for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
      const card = standardizedCards[cardIndex];
      
      // Se já é o card template, pular
      if (card === templateCard) continue;
      
      const newButtons = [];
      
      // Para cada botão no card modelo
      for (let btnIndex = 0; btnIndex < templateButtons.length; btnIndex++) {
        const templateButton = templateButtons[btnIndex];
        
        if (btnIndex < card.buttons.length) {
          // Card já tem este botão, atualizar apenas o tipo
          const existingButton = card.buttons[btnIndex];
          newButtons.push({
            ...existingButton,
            type: templateButton.type,
            // Garantir campos específicos do tipo
            ...(templateButton.type === 'URL' && !existingButton.url ? { url: '' } : {}),
            ...(templateButton.type === 'PHONE_NUMBER' && !existingButton.phoneNumber ? { phoneNumber: '' } : {}),
            ...(templateButton.type === 'QUICK_REPLY' && !existingButton.payload ? { payload: '' } : {})
          });
        } else {
          // Card não tem este botão, criar novo baseado no template
          newButtons.push({
            type: templateButton.type,
            text: '', // Texto vazio para o usuário preencher
            ...(templateButton.type === 'URL' ? { url: '' } : {}),
            ...(templateButton.type === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
            ...(templateButton.type === 'QUICK_REPLY' ? { payload: '' } : {})
          });
        }
      }
      
      standardizedCards[cardIndex] = { ...card, buttons: newButtons };
    }
    
    return standardizedCards;
  }, [cards, numCards]);

  // Aplicar padronização de botões
  const applyButtonStandardization = useCallback(() => {
    const standardizedCards = standardizeButtons();
    setCards(standardizedCards);
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Exibir mensagem de sucesso
    setTimeout(() => {
      if (alert && typeof alert.success === 'function') {
        alert.success('Botões padronizados com sucesso em todos os cards!', {
          position: 'top-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
    
    // Registrar alteração como não salva
    setSuccess('Botões padronizados com sucesso em todos os cards!');
    setTimeout(() => setSuccess(''), 3000);
  }, [standardizeButtons, alert]);

  // Sincronizar tipo de botão em todos os cards
  const syncButtonType = useCallback((buttonIndex, newType) => {
    // Atualizar o tipo do botão em todos os cards ativos
    setCards(prev => {
      const newCards = [...prev];
      
      // Percorrer todos os cards ativos
      for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
        // Verificar se o card tem um botão nesse índice
        if (newCards[cardIndex].buttons.length > buttonIndex) {
          const cardButtons = [...newCards[cardIndex].buttons];
          const existingButton = cardButtons[buttonIndex];
          
          // Atualizar o tipo do botão mantendo os outros campos
          cardButtons[buttonIndex] = {
            ...existingButton,
            type: newType,
            // Adicionar campos específicos do tipo se não existirem
            ...(newType === 'URL' && !existingButton.url ? { url: '' } : {}),
            ...(newType === 'PHONE_NUMBER' && !existingButton.phoneNumber ? { phoneNumber: '' } : {}),
            ...(newType === 'QUICK_REPLY' && !existingButton.payload ? { payload: '' } : {})
          };
          
          // Atualizar o card
          newCards[cardIndex] = {
            ...newCards[cardIndex],
            buttons: cardButtons
          };
        }
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Informar sobre a sincronização
    setTimeout(() => {
      if (alert && typeof alert.info === 'function') {
        alert.info(`Tipo de botão "${newType}" sincronizado em todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [numCards, alert]);

  // Sincronizar adição de botão em todos os cards
  const syncAddButton = useCallback((cardIndex, buttonType = 'QUICK_REPLY') => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Adicionar novo botão em todos os cards ativos
      for (let i = 0; i < numCards; i++) {
        if (i !== cardIndex) {
          const newButton = { 
            type: buttonType, 
            text: '',
            ...(buttonType === 'URL' ? { url: '' } : {}),
            ...(buttonType === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
            ...(buttonType === 'QUICK_REPLY' ? { payload: '' } : {})
          };
          
          const cardButtons = [...newCards[i].buttons, newButton];
          newCards[i] = { ...newCards[i], buttons: cardButtons };
        }
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Informar sobre a adição de botões
    setTimeout(() => {
      if (alert && typeof alert.info === 'function') {
        alert.info(`Botão do tipo "${buttonType}" adicionado a todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [numCards, alert]);

  // Sincronizar remoção de botão em todos os cards
  const syncRemoveButton = useCallback((buttonIndex) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Remover o botão em todos os cards ativos
      for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
        const cardButtons = newCards[cardIndex].buttons.filter((_, idx) => idx !== buttonIndex);
        newCards[cardIndex] = { ...newCards[cardIndex], buttons: cardButtons };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Informar sobre a remoção de botões
    setTimeout(() => {
      if (alert && typeof alert.warning === 'function') {
        alert.warning(`Botão removido de todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [numCards, alert]);
  
  // Adicionar um novo card
  const handleAddCard = useCallback(() => {
    if (numCards < 10) {
      setNumCards(prev => prev + 1);
      setCards(prev => [...prev, createEmptyCard()]);
      
      // Marcar alterações não salvas
      setUnsavedChanges(true);
      
      // Mostrar alerta
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Card ${numCards + 1} adicionado ao carrossel`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    } else {
      // Mostrar alerta de limite máximo
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Limite máximo de 10 cards atingido', {
            position: 'top-center'
          });
        }
      }, 0);
    }
  }, [numCards, alert]);
  
  // Remover o último card
  const handleRemoveCard = useCallback(() => {
    if (numCards > 2) {
      setNumCards(prev => prev - 1);
      
      // Não remover o card do array, apenas diminuir o número de cards visíveis
      // Isso permite recuperar o card se o usuário mudar de ideia
      
      // Marcar alterações não salvas
      setUnsavedChanges(true);
      
      // Mostrar alerta
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Card ${numCards} removido do carrossel`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    } else {
      // Mostrar alerta de limite mínimo
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Um carrossel precisa ter no mínimo 2 cards', {
            position: 'top-center'
          });
        }
      }, 0);
    }
  }, [numCards, alert]);
  
  // Atualizar um campo específico de um card
  const updateCard = useCallback((index, field, value) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Se o índice é válido
      if (index >= 0 && index < newCards.length) {
        // Cria uma cópia do card para modificação
        newCards[index] = { ...newCards[index], [field]: value };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[`card_${index}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`card_${index}_${field}`];
        return newErrors;
      });
    }
  }, [validationErrors]);
  
  // Atualizar um campo específico de um botão em um card
  const updateButtonField = useCallback((cardIndex, buttonIndex, field, value) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Verificar se o card existe
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        const card = newCards[cardIndex];
        
        // Verificar se o botão existe
        if (buttonIndex >= 0 && buttonIndex < card.buttons.length) {
          // Criar cópias para preservar imutabilidade
          const newButtons = [...card.buttons];
          newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
          
          // Atualizar o card com os novos botões
          newCards[cardIndex] = { ...card, buttons: newButtons };
        }
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Se estiver alterando o tipo do botão e for o primeiro card, sincronizar com os outros
    if (field === 'type' && cardIndex === 0 && numCards > 1) {
      syncButtonType(buttonIndex, value);
    }
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[`card_${cardIndex}_button_${buttonIndex}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`card_${cardIndex}_button_${buttonIndex}_${field}`];
        return newErrors;
      });
    }
  }, [validationErrors, numCards, syncButtonType]);
  
  // Adicionar um novo botão a um card
  const addButton = useCallback((cardIndex) => {
    // Verificar se já possui o máximo de botões
    const card = cards[cardIndex];
    if (!card || card.buttons.length >= 2) {
      // Mostrar alerta sobre o limite de botões
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Cada card pode ter no máximo 2 botões', {
            position: 'top-center'
          });
        }
      }, 0);
      return;
    }
    
    // Obter o tipo de botão padrão (usar o tipo do primeiro botão do primeiro card, ou QUICK_REPLY)
    const defaultButtonType = cards[0]?.buttons[0]?.type || 'QUICK_REPLY';
    
    setCards(prev => {
      const newCards = [...prev];
      
      // Se o card existe
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        const newButton = { 
          type: defaultButtonType, 
          text: '',
          ...(defaultButtonType === 'URL' ? { url: '' } : {}),
          ...(defaultButtonType === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
          ...(defaultButtonType === 'QUICK_REPLY' ? { payload: '' } : {})
        };
        
        // Adicionar novo botão aos botões existentes
        const newButtons = [...newCards[cardIndex].buttons, newButton];
        newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Se tiver mais de um card, sincronizar a adição com os outros cards
    if (numCards > 1) {
      syncAddButton(cardIndex, defaultButtonType);
    } else {
      // Mostrar alerta sobre adição de botão
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Botão adicionado ao Card ${cardIndex + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    }
  }, [cards, numCards, syncAddButton, alert]);
  
  // Remover um botão de um card
  const removeButton = useCallback((cardIndex, buttonIndex) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Se o card existe
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        // Remover o botão especificado
        const newButtons = newCards[cardIndex].buttons.filter((_, i) => i !== buttonIndex);
        newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Se tiver mais de um card, sincronizar a remoção com os outros cards
    if (numCards > 1) {
      syncRemoveButton(buttonIndex);
    } else {
      // Mostrar alerta sobre remoção de botão
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Botão removido do Card ${cardIndex + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    }
  }, [numCards, syncRemoveButton, alert]);
  
  /**
   * Realiza o upload dos arquivos dos cards para a API
   * Esta função preserva os fileHandles existentes e só faz upload de novos arquivos
   */
  const handleUploadFiles = useCallback(async () => {
    const uploadResults = await uploadFiles(cards, authKey);
  
    // Verificar se algum upload falhou
    const failedUploads = uploadResults.filter(result => result.status === 'failure');
    
    if (failedUploads.length > 0) {
      // Tratar uploads que falharam
      failedUploads.forEach(failedUpload => {
        const { error } = failedUpload;
        
        if (error.isExpiredHandle) {
          // Caso específico de handle expirado
          alert.error(`Handle expirado para o card ${error.cardIndex + 1}: ${error.message}`, {
            position: 'top-center'
          });
        } else {
          // Erro genérico de upload
          alert.error(`Falha no upload do card ${error.cardIndex + 1}: ${error.message}`, {
            position: 'top-center'
          });
        }
      });
      
      // Não prosseguir se houver falhas
      return;
    }
    // Validar antes de prosseguir
    if (!validateStepOne(true)) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }

    // Salvar o estado atual antes de fazer uploads
    // Isso garante que os fileHandles existentes sejam preservados
    saveCurrentState();
  
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mostrar alerta de início do processo
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info('Iniciando processo de upload...', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }
      }, 0);
      
      setSuccess('Iniciando processo de upload...');
      
      // Separar cards em dois grupos:
      // 1. Cards com fileHandles válidos (podem pular upload)
      // 2. Cards que precisam de upload (sem fileHandle ou com URL alterada)
      
      // Carregar o rascunho mais recente para obter os fileHandles mais atualizados
      const savedDraft = loadDraft();
      const savedCards = savedDraft?.cards || [];
      
      // Mapear cada card atual para verificar se precisa de upload
      const currentCards = cards.slice(0, numCards);
      
      // Cards que já têm fileHandle e URL não mudou (podem pular upload)
      const cardsWithValidHandles = [];
      // Cards que precisam de upload
      const cardsToUpload = [];
      
      // Verificar cada card atual
      currentCards.forEach((card, index) => {
        // Se não tem URL, pular
        if (!card.fileUrl) return;
        
        // Verificar se existe um card salvo correspondente
        const savedCard = savedCards[index];
        
        // Verificar se o card já tem um fileHandle válido e a URL não mudou
        if (savedCard && 
            savedCard.fileHandle && 
            savedCard.fileUrl === card.fileUrl) {
          // Atualizar o card atual com o fileHandle salvo
          const updatedCard = { ...card, fileHandle: savedCard.fileHandle };
          cardsWithValidHandles.push(updatedCard);
          
          // Atualizar o card no estado
          updateCard(index, 'fileHandle', savedCard.fileHandle);
        } else if (card.fileUrl) {
          // Card precisa de upload
          cardsToUpload.push(card);
        }
      });
      
      console.log('Cards com fileHandles válidos:', cardsWithValidHandles.length);
      console.log('Cards que precisam de upload:', cardsToUpload.length);
      
      // Resultados finais combinados
      let finalResults = [];
      
      // Adicionar resultados dos cards que já têm fileHandle
      cardsWithValidHandles.forEach(card => {
        finalResults.push({
          fileHandle: card.fileHandle,
          status: 'cached', // Status especial para indicar que foi carregado do cache
          cardIndex: cards.indexOf(card)
        });
      });
      
      // Se houver cards para upload, fazer o upload
      if (cardsToUpload.length > 0) {
        // Fazer upload dos arquivos que precisam
        const newResults = await uploadFiles(cardsToUpload, authKey);
        
        // Mapear resultados aos índices originais dos cards
        for (let i = 0; i < newResults.length; i++) {
          const result = newResults[i];
          const originalCard = cardsToUpload[i];
          const originalIndex = cards.indexOf(originalCard);
          
          // Adicionar o índice original ao resultado
          result.cardIndex = originalIndex;
          
          // Atualizar o card com o fileHandle recebido
          updateCard(originalIndex, 'fileHandle', result.fileHandle);
          
          // Adicionar ao array de resultados finais
          finalResults.push(result);
        }
      }
      
      // Ordenar resultados pelo índice original
      finalResults.sort((a, b) => a.cardIndex - b.cardIndex);
      
      // Definir os resultados de upload
      setUploadResults(finalResults);
      
      // Salvar novamente o estado para garantir que todos os fileHandles estão preservados
      saveCurrentState();
      
      // Mensagem de sucesso baseada em quantos arquivos foram processados
      const skippedCount = cardsWithValidHandles.length;
      let successMessage = '';

      if (cardsToUpload.length > 0 && skippedCount > 0) {
        successMessage = `${cardsToUpload.length} arquivo(s) enviado(s) e ${skippedCount} carregado(s) do cache`;
      } else if (cardsToUpload.length > 0) {
        successMessage = `${cardsToUpload.length} arquivo(s) enviado(s) com sucesso`;
      } else if (skippedCount > 0) {
        successMessage = `${skippedCount} arquivo(s) carregado(s) do cache`;
      } else {
        successMessage = 'Nenhum arquivo precisava ser processado';
      }
      
      setSuccess(successMessage);

      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      // Mostrar alerta de sucesso
      setTimeout(() => {
        if (alert && typeof alert.success === 'function') {
          alert.success(successMessage, {
            position: 'top-right'
          });
        }
      }, 0);
      
      // Avançar para a próxima etapa
      setStep(2);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Mostrar alerta de erro
      setTimeout(() => {
        if (alert && typeof alert.error === 'function') {
          alert.error(`Erro durante o processo de upload: ${errorMessage}`, {
            position: 'top-center',
            autoCloseTime: 7000
          });
        }
      }, 0);
      
      console.error('Erro durante o processo de upload:', err);
    } finally {
      setLoading(false);
    }
  }, [authKey, cards, numCards, updateCard, validateStepOne, saveCurrentState, alert]);
  
  // Avançar para o próximo passo com validação
  const handleNextStep = useCallback(() => {
    setHasTriedToAdvance(true); // Marcar que o usuário tentou avançar
    const isValid = validateStepOne(true); // Forçar validação com alertas
    if (isValid) {
      // Salvar o estado atual antes de avançar
      saveCurrentState();
      setStep((prev) => prev + 1); // Avançar para o próximo passo
    }
  }, [validateStepOne, saveCurrentState]);

  // Criar o template
  const handleCreateTemplate = useCallback(async () => {
    // Validar antes de prosseguir
    const errors = validateStepTwo();
    if (errors.length > 0) {
      setError('Por favor, corrija os erros antes de continuar.');
      showValidationErrors(errors);
      return;
    }
    
    // Verificar consistência de botões
    const consistency = checkButtonConsistency();
    
    // Se não for consistente, padronizar os botões antes de prosseguir
    if (!consistency.isConsistent) {
      // Mostrar alerta sobre a padronização necessária
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Inconsistência detectada nos botões. O WhatsApp exige que todos os cards tenham o mesmo número e tipos de botões. Será realizada uma padronização automática.', {
            position: 'top-center',
            autoCloseTime: 5000
          });
        }
      }, 0);
      
      // Padronizar botões
      const standardizedCards = standardizeButtons();
      
      // Verificar se a padronização criou campos vazios obrigatórios
      const hasEmptyRequiredFields = standardizedCards.slice(0, numCards).some(card => 
        card.buttons.some(button => {
          if (!button.text) return true;
          if (button.type === 'URL' && !button.url) return true;
          if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) return true;
          return false;
        })
      );
      
      if (hasEmptyRequiredFields) {
        // Atualizar os cards com a versão padronizada
        setCards(standardizedCards);
        
        // Informar ao usuário que precisa preencher os campos
        setError('A padronização de botões criou novos campos que precisam ser preenchidos. Por favor, revise os botões em todos os cards.');
        
        // Mostrar alerta sobre campos obrigatórios vazios
        setTimeout(() => {
          if (alert && typeof alert.warning === 'function') {
            alert.warning('A padronização de botões criou novos campos que precisam ser preenchidos. Por favor, revise os botões em todos os cards.', {
              position: 'top-center',
              autoCloseTime: 7000
            });
          }
        }, 0);
        
        return;
      }
      
      // Se não tiver campos vazios obrigatórios, prosseguir com os cards padronizados
      setCards(standardizedCards);
      
      // Informar ao usuário sobre a padronização
      setSuccess('Botões padronizados automaticamente para atender aos requisitos do WhatsApp.');
      
      // Mostrar alerta sobre a padronização automática
      setTimeout(() => {
        if (alert && typeof alert.success === 'function') {
          alert.success('Botões padronizados automaticamente para atender aos requisitos do WhatsApp.', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }
      }, 0);
      
      // Pequena pausa para o usuário ver a mensagem
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Usar a versão mais recente dos cards (possivelmente padronizada)
      const cardsToUse = cards.slice(0, numCards);
      
      // Validar informações do template
      validateTemplate(templateName, bodyText, authKey, cardsToUse);

      // Criar template na API
      const { templateJson, sendTemplateJson, builderTemplateJson } = await createTemplate(
        templateName, 
        language, 
        bodyText, 
        cardsToUse, 
        authKey
      );

      // Armazenar os JSONs gerados
      setFinalJson({
        createTemplate: templateJson,
        sendTemplate: sendTemplateJson,
        builderTemplate: builderTemplateJson
      });

      // Salvar o estado atual
      saveCurrentState();
      
      // Avançar para a próxima etapa
      setStep(3);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Mostrar alerta de erro
      setTimeout(() => {
        if (alert && typeof alert.error === 'function') {
          alert.error(`Erro ao criar template: ${errorMessage}`, {
            position: 'top-center',
            autoCloseTime: 7000
          });
        }
      }, 0);
      
      console.error('Erro ao criar template:', err);
    } finally {
      setLoading(false);
    }
  }, [templateName, language, bodyText, authKey, cards, numCards, validateStepTwo, saveCurrentState, checkButtonConsistency, standardizeButtons, alert, showValidationErrors]);
  
  /**
   * Envia o template para um número de telefone
   */
  const sendTemplate = useCallback(async (phoneNumberToSend = phoneNumber) => {
    // Verificar se temos um número de telefone
    if (!phoneNumberToSend) {
      const errorMsg = 'Número de telefone é obrigatório para enviar o template';
      setError(errorMsg);
      
      alert.error(errorMsg, {
        position: 'top-center'
      });
      
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      // Mostrar alerta de envio apenas uma vez
      alert.info(`Enviando template para ${phoneNumberToSend}...`, {
        position: 'top-right',
        autoCloseTime: 3000
      });
      
      const formattedPhone = validatePhoneNumber(phoneNumberToSend);
      
      if (!finalJson || !finalJson.sendTemplate) {
        throw new Error('Template não disponível para envio. Por favor, complete a etapa 2 primeiro.');
      }
      
      // Enviar template
      await sendTemplateMessage(formattedPhone, finalJson.sendTemplate, authKey);
      
      const successMsg = `Template enviado com sucesso para ${phoneNumberToSend}!`;
      
      // Definir o sucesso apenas uma vez
      setSuccess(successMsg);
      
      // Mostrar alerta de sucesso apenas uma vez
      alert.success(successMsg, {
        position: 'top-right',
        autoCloseTime: 3000
      });
      
      // Limpar o sucesso após 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      alert.error(`Erro no envio: ${errorMessage}`, {
        position: 'top-center',
        autoCloseTime: 7000
      });
      
      console.error("Erro no envio:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, finalJson, authKey, alert]);
  
  // Copiar o JSON do template para a área de transferência
  const copyToClipboard = useCallback((jsonType) => {
    try {
      if (!finalJson || !finalJson[jsonType]) {
        const errorMsg = 'Não foi possível copiar. JSON não disponível.';
        setError(errorMsg);
        
        // Mostrar alerta de erro
        setTimeout(() => {
          if (alert && typeof alert.error === 'function') {
            alert.error(errorMsg, {
              position: 'top-center'
            });
          }
        }, 0);
        
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(finalJson[jsonType], null, 2))
        .then(() => {
          const successMsg = `JSON para ${jsonType === 'createTemplate' ? 'criação do template' : jsonType === 'sendTemplate' ? 'envio do template' : 'integração com Builder'} copiado!`;
          setSuccess(successMsg);
          
          // Mostrar alerta de sucesso
          setTimeout(() => {
            if (alert && typeof alert.success === 'function') {
              alert.success(successMsg, {
                position: 'bottom-right',
                autoCloseTime: 3000
              });
            }
          }, 0);
          
          // Limpar a mensagem de sucesso após 3 segundos
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        })
        .catch(err => {
          const errorMsg = `Erro ao copiar: ${err.message}`;
          setError(errorMsg);
          
          // Mostrar alerta de erro
          setTimeout(() => {
            if (alert && typeof alert.error === 'function') {
              alert.error(errorMsg, {
                position: 'top-center'
              });
            }
          }, 0);
        });
    } catch (err) {
      const errorMsg = `Erro ao copiar: ${err.message}`;
      setError(errorMsg);
      
      // Mostrar alerta de erro
      setTimeout(() => {
        if (alert && typeof alert.error === 'function') {
          alert.error(errorMsg, {
            position: 'top-center'
          });
        }
      }, 0);
    }
  }, [finalJson, alert]);
  
  // Reiniciar o formulário para criar um novo template
  const resetForm = useCallback(() => {
    // Confirmar antes de resetar
    if (window.confirm('Tem certeza que deseja criar um novo template? Os dados atuais serão perdidos.')) {
      setStep(1);
      setCards(Array(2).fill().map(() => createEmptyCard()));
      setNumCards(2);
      setTemplateName('');
      setBodyText('');
      setFinalJson({});
      setPhoneNumber('');
      setError('');
      setSuccess('');
      setValidationErrors({});
      
      // Limpar o rascunho salvo
      clearDraft();
      setLastSavedTime(null);
      setUnsavedChanges(false);
      
      // Mostrar alerta de reset
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info('Template resetado. Você pode começar um novo template agora.', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }
      }, 0);
    }
  }, [alert]);

  // Ir para o passo anterior
  const goToPreviousStep = useCallback(() => {
    if (step > 1) {
      // Salvar o estado atual antes de voltar ao passo anterior
      // Isso é crucial para preservar os fileHandles entre passos
      saveCurrentState();
      
      setStep(prev => prev - 1);
      setError('');
      
      // Mostrar alerta de navegação
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Retornando para o passo ${step - 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    }
  }, [step, alert, saveCurrentState]);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Atualizar campos de texto com limpeza de validação
  const handleInputChange = useCallback((field, value) => {
    setHasInteracted(true); // Marcar que o usuário interagiu
    
    // Atualizar o campo apropriado
    switch (field) {
      case 'authKey':
        setAuthKey(value);
        break;
      case 'templateName':
        setTemplateName(value);
        break;
      case 'bodyText':
        setBodyText(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      default:
        break;
    }
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Limpar erros de validação relacionados ao campo
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Manipulador de Save/Load e status de salvamento para conectar com UI
  const handleSaveBeforeUpload = useCallback(() => {
    // Verificar se a função saveCurrentState existe
    const saveSuccess = saveCurrentState();
    
    if (saveSuccess) {
      // Adicionar alerta de sucesso
      setTimeout(() => {
        if (alert && typeof alert.success === 'function') {
          alert.success("Rascunho salvo com sucesso!", {
            position: 'bottom-right',
            autoCloseTime: 3000
          });
        }
      }, 0);
    } else {
      // Mostrar erro se o salvamento falhou
      setTimeout(() => {
        if (alert && typeof alert.error === 'function') {
          alert.error("Não foi possível salvar o rascunho.", {
            position: 'top-center',
            autoCloseTime: 5000
          });
        }
      }, 0);
    }
    
    return saveSuccess;
  }, [saveCurrentState, alert]);

  return {
    // Estados
    step, setStep,
    authKey, setAuthKey,
    numCards,
    templateName, setTemplateName,
    language, setLanguage,
    bodyText, setBodyText,
    finalJson,
    phoneNumber, setPhoneNumber,
    uploadResults,
    loading,
    error,
    success,
    cards, setCards,
    validationErrors,
    unsavedChanges,
    lastSavedTime,
    hasInteracted,
    setHasInteracted,
    
    // Métodos
    handleAddCard,
    handleRemoveCard,
    updateCard,
    updateButtonField,
    addButton,
    removeButton,
    handleUploadFiles,
    handleCreateTemplate,
    sendTemplate,
    copyToClipboard,
    resetForm,
    goToPreviousStep,
    clearMessages,
    isStepValid,
    handleInputChange,
    handleNextStep,
    
    // Funções de sincronização de botões
    checkButtonConsistency,
    standardizeButtons,
    applyButtonStandardization,
    syncButtonType,
    syncAddButton,
    syncRemoveButton,
    
    // Funções específicas de rascunho
    saveCurrentState,
    handleSaveBeforeUpload,
  };
};