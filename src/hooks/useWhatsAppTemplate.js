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
  
  // Refs to prevent multiple draft loads
  const draftLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  
  // States 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  // Template states
  const [authKey, setAuthKey] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('pt_BR');
  const [bodyText, setBodyText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [hasInteracted, setHasInteracted] = useState(false);

  // Card states
  const [numCards, setNumCards] = useState(2);
  const [cards, setCards] = useState([
    createEmptyCard(),
    createEmptyCard()
  ]);
  
  // Result states
  const [uploadResults, setUploadResults] = useState([]);
  const [finalJson, setFinalJson] = useState({});

  // Create empty card function
  function createEmptyCard() {
    return {
      fileUrl: '',
      fileType: 'image',
      fileHandle: '',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: '', payload: '' }]
    };
  }

  // Save current state to draft
  const saveCurrentState = useCallback(() => {
    const currentTime = new Date();
    const state = {
      templateName,
      language,
      bodyText,
      cards,
      authKey,
      lastSavedTime: currentTime.toISOString()
    };
    
    const saveSuccess = saveDraft(state);
    
    if (saveSuccess) {
      setLastSavedTime(currentTime);
      setUnsavedChanges(false);
      return true;
    }
    
    return false;
  }, [templateName, language, bodyText, cards, authKey]);

  // Load draft on initial render - FIXED to avoid state updates during render
  useEffect(() => {
    // Prevent multiple draft loads
    if (draftLoadedRef.current) return;
    draftLoadedRef.current = true; // Mark as attempted to prevent multiple loads

    const loadDraftSafely = () => {
      try {
        const savedDraft = loadDraft();
        
        if (savedDraft) {
          // Use a single setState call to update all values at once
          const updatedState = {};
          
          if (savedDraft.templateName) updatedState.templateName = savedDraft.templateName;
          if (savedDraft.language) updatedState.language = savedDraft.language;
          if (savedDraft.bodyText) updatedState.bodyText = savedDraft.bodyText;
          if (savedDraft.authKey) updatedState.authKey = savedDraft.authKey;
          
          // Handle cards safely
          if (savedDraft.cards && savedDraft.cards.length >= 2) {
            updatedState.cards = savedDraft.cards;
            updatedState.numCards = savedDraft.cards.length;
          }
          
          // Set last saved time if available
          if (savedDraft.lastSavedTime) {
            updatedState.lastSavedTime = new Date(savedDraft.lastSavedTime);
          }
          
          // Apply all state updates at once
          if (Object.keys(updatedState).length > 0) {
            // Set template name
            if (updatedState.templateName) setTemplateName(updatedState.templateName);
            // Set language
            if (updatedState.language) setLanguage(updatedState.language);
            // Set body text
            if (updatedState.bodyText) setBodyText(updatedState.bodyText);
            // Set auth key
            if (updatedState.authKey) setAuthKey(updatedState.authKey);
            // Set cards
            if (updatedState.cards) {
              setCards(updatedState.cards);
              setNumCards(updatedState.numCards);
            }
            // Set last saved time
            if (updatedState.lastSavedTime) {
              setLastSavedTime(updatedState.lastSavedTime);
            }
            
            // Show draft loaded alert with delay (moved outside render cycle)
            setTimeout(() => {
              if (alert && typeof alert.info === 'function') {
                alert.info('Rascunho anterior carregado com sucesso!', {
                  position: 'top-right',
                  autoCloseTime: 3000
                });
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
      }
    };

    // Use setTimeout to ensure this runs after initial render is complete
    setTimeout(loadDraftSafely, 0);
  }, []); // Empty dependency array to run only once
  
  // Autosave effect
  useEffect(() => {
    // Skip initial effect run to avoid marking changes during load
    if (!draftLoadedRef.current) return;
    
    // Mark unsaved changes
    if (!unsavedChanges) {
      setUnsavedChanges(true);
    }
    
    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new autosave timer
    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentState();
    }, 30000);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [templateName, language, bodyText, cards, authKey, unsavedChanges, saveCurrentState]);

  const showValidationErrors = useCallback((errorMessages) => {
    if (!errorMessages || errorMessages.length === 0) return;
  
    // Use o `useAlertSafe` para evitar alertas duplicados ou muito frequentes
    if (alert && typeof alert.error === 'function') {
      setTimeout(() => {
        alert.error(`Problemas de validação encontrados:\n${errorMessages.join('\n')}`, {
          position: 'top-center',
          autoCloseTime: 7000
        });
      }, 0);
    }
  }, [alert]);
  
  // Validation functions with safe alert handling - FIXED to avoid calling alert during render
  const validateStepOne = useCallback((triggerAlerts = false) => {
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
  
    // Disparar alertas apenas se `triggerAlerts` for verdadeiro
    if (triggerAlerts && errorMessages.length > 0) {
      showValidationErrors(errorMessages);
    }
  
    return errorMessages.length === 0;
  }, [authKey, cards, numCards, showValidationErrors]);
  



  
  const validateStepTwo = useCallback(() => {
    const errors = {};
    const errorMessages = [];
    
    // Validate template name
    if (!templateName) {
      errors.templateName = 'Nome do template é obrigatório';
      errorMessages.push('Nome do template é obrigatório');
    } else if (templateName.length < 3) {
      errors.templateName = 'Nome do template deve ter pelo menos 3 caracteres';
      errorMessages.push('Nome do template deve ter pelo menos 3 caracteres');
    }
    
    // Validate body text
    if (!bodyText) {
      errors.bodyText = 'Texto do corpo da mensagem é obrigatório';
      errorMessages.push('Texto do corpo da mensagem é obrigatório');
    } else if (bodyText.length > 1024) {
      errors.bodyText = `Texto do corpo excede o limite de 1024 caracteres. Atual: ${bodyText.length}`;
      errorMessages.push(`Texto do corpo excede o limite de 1024 caracteres (${bodyText.length})`);
    }
    
    // Validate cards
    cards.slice(0, numCards).forEach((card, index) => {
      // Validate card body text
      if (!card.bodyText) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} é obrigatório`;
        errorMessages.push(`Card ${index + 1}: texto é obrigatório`);
      } else if (card.bodyText.length > 160) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} excede o limite de 160 caracteres`;
        errorMessages.push(`Card ${index + 1}: texto excede limite de 160 caracteres`);
      }
      
      // Validate buttons
      if (!card.buttons || card.buttons.length === 0) {
        errors[`card_${index}_buttons`] = `Adicione pelo menos um botão para o card ${index + 1}`;
        errorMessages.push(`Card ${index + 1}: adicione pelo menos um botão`);
      } else {
        card.buttons.forEach((button, btnIndex) => {
          // Validate button text
          if (!button.text) {
            errors[`card_${index}_button_${btnIndex}_text`] = `Texto do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: texto é obrigatório`);
          }
          
          // Validate URL button
          if (button.type === 'URL' && !button.url) {
            errors[`card_${index}_button_${btnIndex}_url`] = `URL do botão ${btnIndex + 1} no card ${index + 1} é obrigatória`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: URL é obrigatória`);
          }
          
          // Validate phone number button
          if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
            errors[`card_${index}_button_${btnIndex}_phoneNumber`] = `Número de telefone do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: número de telefone é obrigatório`);
          }
        });
      }
    });
    
    // Update validation errors
    setValidationErrors(errors);
    
    // Return errors without directly calling alert
    return errorMessages.length > 0 ? errorMessages : [];
  }, [templateName, bodyText, cards, numCards]);
  
  const validateStepThree = useCallback(() => {
    const errors = {};
    const errorMessages = [];
    
    // Validate phone number
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
    
    // Update validation errors
    setValidationErrors(errors);
    
    // Return errors without directly calling alert
    return errorMessages.length > 0 ? errorMessages : [];
  }, [phoneNumber]);
  
  // Update isStepValid to return errors but not directly show alerts
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
  
  /**
   * Verifica a consistência dos botões entre todos os cards
   */
  const checkButtonConsistency = useCallback(() => {
    const activeCards = cards.slice(0, numCards);
    
    // Retorna consistente se houver apenas um card
    if (activeCards.length <= 1) {
      return { 
        isConsistent: true,
        message: "Consistente: Apenas um card no carrossel."
      };
    }
    
    // Coletar informações de botões do primeiro card para referência
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
    
    // Incluir informações sobre o que será padronizado
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

  /**
   * Padroniza os botões em todos os cards para garantir consistência
   */
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

  /**
   * Aplica a padronização dos botões diretamente nos cards
   */
  const applyButtonStandardization = useCallback(() => {
    const standardizedCards = standardizeButtons();
    setCards(standardizedCards);
    
    // Exibir mensagem de sucesso
    setSuccess('Botões padronizados com sucesso em todos os cards!');
    
    // Mostrar alerta de sucesso - FIXED to run outside of render
    if (alert && typeof alert.success === 'function') {
      setTimeout(() => {
        alert.success('Botões padronizados com sucesso em todos os cards!', {
          position: 'top-right',
          autoCloseTime: 3000
        });
      }, 0);
    }
    
    setTimeout(() => setSuccess(''), 3000);
  }, [standardizeButtons, alert]);

  /**
   * Sincroniza um tipo de botão em todos os cards
   */
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
    
    // Informar sobre a sincronização - FIXED with setTimeout
    if (alert && typeof alert.info === 'function') {
      setTimeout(() => {
        alert.info(`Tipo de botão "${newType}" sincronizado em todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }, 0);
    }
  }, [numCards, alert]);

  /**
   * Sincroniza a adição de botões em todos os cards
   */
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
    
    // Informar sobre a adição de botões - FIXED with setTimeout
    if (alert && typeof alert.info === 'function') {
      setTimeout(() => {
        alert.info(`Botão do tipo "${buttonType}" adicionado a todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }, 0);
    }
  }, [numCards, alert]);

  /**
   * Sincroniza a remoção de botões em todos os cards
   */
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
    
    // Informar sobre a remoção de botões - FIXED with setTimeout
    if (alert && typeof alert.warning === 'function') {
      setTimeout(() => {
        alert.warning(`Botão removido de todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }, 0);
    }
  }, [numCards, alert]);
  
  /**
   * Adiciona um novo card ao template
   */
  const handleAddCard = useCallback(() => {
    if (numCards < 10) {
      setNumCards(prev => prev + 1);
      setCards(prev => [...prev, createEmptyCard()]);
      
      // Alerta ao adicionar card - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info(`Card ${numCards + 1} adicionado ao carrossel`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }, 0);
      }
    } else {
      // Alerta quando atingir o limite de cards - FIXED with setTimeout
      if (alert && typeof alert.warning === 'function') {
        setTimeout(() => {
          alert.warning('Limite máximo de 10 cards atingido', {
            position: 'top-center'
          });
        }, 0);
      }
    }
  }, [numCards, alert]);
  
  /**
   * Remove o último card do template
   */
  const handleRemoveCard = useCallback(() => {
    if (numCards > 2) {
      setNumCards(prev => prev - 1);
      setCards(prev => prev.slice(0, prev.length - 1));
      
      // Alerta ao remover card - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info(`Card ${numCards} removido do carrossel`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }, 0);
      }
    } else {
      // Alerta quando tentar remover além do mínimo - FIXED with setTimeout
      if (alert && typeof alert.warning === 'function') {
        setTimeout(() => {
          alert.warning('Um carrossel precisa ter no mínimo 2 cards', {
            position: 'top-center'
          });
        }, 0);
      }
    }
  }, [numCards, alert]);
  
  /**
   * Atualiza um campo específico de um card
   */
  const updateCard = useCallback((index, field, value) => {
    setCards(prev => {
      const newCards = [...prev];
      newCards[index] = { ...newCards[index], [field]: value };
      return newCards;
    });
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[`card_${index}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`card_${index}_${field}`];
        return newErrors;
      });
    }
  }, [validationErrors]);
  
  /**
   * Atualiza um campo específico de um botão em um card
   */
  const updateButtonField = useCallback((cardIndex, buttonIndex, field, value) => {
    setCards(prev => {
      const newCards = [...prev];
      const newButtons = [...newCards[cardIndex].buttons];
      newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
      newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      return newCards;
    });
    
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
  
  /**
   * Adiciona um novo botão a um card
   */
  const addButton = useCallback((cardIndex) => {
    // Verificar se já possui o máximo de botões
    const card = cards[cardIndex];
    if (card.buttons.length >= 2) {
      // Alerta sobre o limite de botões - FIXED with setTimeout
      if (alert && typeof alert.warning === 'function') {
        setTimeout(() => {
          alert.warning('Cada card pode ter no máximo 2 botões', {
            position: 'top-center'
          });
        }, 0);
      }
      return;
    }
    
    // Obter o tipo de botão padrão (usar o tipo do primeiro botão do primeiro card, ou QUICK_REPLY)
    const defaultButtonType = cards[0]?.buttons[0]?.type || 'QUICK_REPLY';
    
    setCards(prev => {
      const newCards = [...prev];
      const newButtons = [...newCards[cardIndex].buttons, { 
        type: defaultButtonType, 
        text: '',
        ...(defaultButtonType === 'URL' ? { url: '' } : {}),
        ...(defaultButtonType === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
        ...(defaultButtonType === 'QUICK_REPLY' ? { payload: '' } : {})
      }];
      newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      return newCards;
    });
    
    // Se tiver mais de um card, sincronizar a adição com os outros cards
    if (numCards > 1) {
      syncAddButton(cardIndex, defaultButtonType);
    } else {
      // Alerta sobre adição de botão apenas para o card atual - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info(`Botão adicionado ao Card ${cardIndex + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }, 0);
      }
    }
  }, [cards, numCards, syncAddButton, alert]);
  
  /**
   * Remove um botão de um card
   */
  const removeButton = useCallback((cardIndex, buttonIndex) => {
    setCards(prev => {
      const newCards = [...prev];
      const newButtons = newCards[cardIndex].buttons.filter((_, i) => i !== buttonIndex);
      newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      return newCards;
    });
    
    // Se tiver mais de um card, sincronizar a remoção com os outros cards
    if (numCards > 1) {
      syncRemoveButton(buttonIndex);
    } else {
      // Alerta sobre remoção de botão apenas para o card atual - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info(`Botão removido do Card ${cardIndex + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }, 0);
      }
    }
  }, [numCards, syncRemoveButton, alert]);
  
/**
 * Faz o upload dos arquivos dos cards para a API, pulando aqueles que já têm fileHandle
 */
const handleUploadFiles = useCallback(async () => {
  // Validar antes de prosseguir
  if (!validateStepOne(true)) {
    setError('Por favor, corrija os erros antes de continuar.');
    return;
  }

  const errors = validateStepOne();
  if (errors.length > 0) {
    setError('Por favor, corrija os erros antes de continuar.');
    showValidationErrors(errors);
    return;
  }
  
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Mostrar alerta de início do processo
    if (alert && typeof alert.info === 'function') {
      setTimeout(() => {
        alert.info('Iniciando processo de upload...', {
          position: 'top-right',
          autoCloseTime: 3000
        });
      }, 0);
    }
    
    setSuccess('Iniciando processo de upload...');
    
    // Filtrar apenas cards que precisam de upload (sem fileHandle)
    const cardsToUpload = cards.slice(0, numCards).filter(card => 
      card.fileUrl && (!card.fileHandle || card.fileHandle === '')
    );
    
    // Cards que já têm fileHandle (podem pular o upload)
    const cardsWithHandles = cards.slice(0, numCards).filter(card => 
      card.fileUrl && card.fileHandle && card.fileHandle !== ''
    );
    
    // Resultados finais combinados
    let finalResults = [];
    
    // Adicionar resultados dos cards que já têm fileHandle
    cardsWithHandles.forEach(card => {
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
    
    // Mensagem de sucesso baseada em quantos arquivos foram processados
    const skippedCount = cardsWithHandles.length;
    let successMessage = '';
    
    if (skippedCount > 0) {
      successMessage = `${cardsToUpload.length} arquivo(s) enviado(s) e ${skippedCount} carregado(s) do cache!`;
    } else {
      successMessage = `Todos os ${numCards} arquivos foram processados com sucesso!`;
    }
    
    setSuccess(successMessage);
    
    // Mostrar alerta de sucesso
    if (alert && typeof alert.success === 'function') {
      setTimeout(() => {
        alert.success(successMessage, {
          position: 'top-right'
        });
      }, 0);
    }
    
    // Salvar o estado atual com fileHandles preservados
    saveCurrentState();
    
    // Avançar para a próxima etapa
    setStep(2);
  } catch (err) {
    const errorMessage = handleApiError(err);
    setError(errorMessage);
    
    // Mostrar alerta de erro
    if (alert && typeof alert.error === 'function') {
      setTimeout(() => {
        alert.error(`Erro durante o processo de upload: ${errorMessage}`, {
          position: 'top-center',
          autoCloseTime: 7000
        });
      }, 0);
    }
    
    console.error('Erro durante o processo de upload:', err);
  } finally {
    setLoading(false);
  }
}, [authKey, cards, numCards, updateCard, validateStepOne, saveCurrentState, alert, showValidationErrors, uploadFiles]);
  
  /**
   * Cria o template baseado nas informações fornecidas
   * com padronização automática de botões para atender aos requisitos do WhatsApp
   */
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
      // Mostrar alerta sobre a padronização necessária - FIXED with setTimeout
      if (alert && typeof alert.warning === 'function') {
        setTimeout(() => {
          alert.warning('Inconsistência detectada nos botões. O WhatsApp exige que todos os cards tenham o mesmo número e tipos de botões. Será realizada uma padronização automática.', {
            position: 'top-center',
            autoCloseTime: 5000
          });
        }, 0);
      }
      
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
        
        // Mostrar alerta sobre campos obrigatórios vazios - FIXED with setTimeout
        if (alert && typeof alert.warning === 'function') {
          setTimeout(() => {
            alert.warning('A padronização de botões criou novos campos que precisam ser preenchidos. Por favor, revise os botões em todos os cards.', {
              position: 'top-center',
              autoCloseTime: 7000
            });
          }, 0);
        }
        
        return;
      }
      
      // Se não tiver campos vazios obrigatórios, prosseguir com os cards padronizados
      setCards(standardizedCards);
      
      // Informar ao usuário sobre a padronização
      setSuccess('Botões padronizados automaticamente para atender aos requisitos do WhatsApp.');
      
      // Mostrar alerta sobre a padronização automática - FIXED with setTimeout
      if (alert && typeof alert.success === 'function') {
        setTimeout(() => {
          alert.success('Botões padronizados automaticamente para atender aos requisitos do WhatsApp.', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }, 0);
      }
      
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
      
      setSuccess('Validações concluídas. Criando template...');
      
      // Mostrar alerta de criação - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info('Validações concluídas. Criando template...', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }, 0);
      }
      
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

      setSuccess('Template criado com sucesso!');
      
      // Mostrar alerta de sucesso - FIXED with setTimeout
      if (alert && typeof alert.success === 'function') {
        setTimeout(() => {
          alert.success('Template criado com sucesso!', {
            position: 'top-right'
          });
        }, 0);
      }
      
      // Salvar o estado atual
      saveCurrentState();
      
      // Avançar para a próxima etapa
      setStep(3);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Mostrar alerta de erro - FIXED with setTimeout
      if (alert && typeof alert.error === 'function') {
        setTimeout(() => {
          alert.error(`Erro ao criar template: ${errorMessage}`, {
            position: 'top-center',
            autoCloseTime: 7000
          });
        }, 0);
      }
      
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
      
      // Mostrar alerta de erro - FIXED with setTimeout
      if (alert && typeof alert.error === 'function') {
        setTimeout(() => {
          alert.error(errorMsg, {
            position: 'top-center'
          });
        }, 0);
      }
      
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mostrar alerta de envio - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info(`Enviando template para ${phoneNumberToSend}...`, {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }, 0);
      }
      
      const formattedPhone = validatePhoneNumber(phoneNumberToSend);
      
      // Validar template
      if (!finalJson || !finalJson.sendTemplate) {
        throw new Error('Template não disponível para envio. Por favor, complete a etapa 2 primeiro.');
      }
      
      // Enviar template
      await sendTemplateMessage(formattedPhone, finalJson.sendTemplate, authKey);
      
      const successMsg = `Template enviado com sucesso para ${phoneNumberToSend}!`;
      setSuccess(successMsg);
      
      // Mostrar alerta de sucesso - FIXED with setTimeout
      if (alert && typeof alert.success === 'function') {
        setTimeout(() => {
          alert.success(successMsg, {
            position: 'top-right'
          });
        }, 0);
      }
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Mostrar alerta de erro - FIXED with setTimeout
      if (alert && typeof alert.error === 'function') {
        setTimeout(() => {
          alert.error(`Erro no envio: ${errorMessage}`, {
            position: 'top-center',
            autoCloseTime: 7000
          });
        }, 0);
      }
      
      console.error("Erro no envio:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, finalJson, authKey, alert]);
  
  /**
   * Copia o JSON do template para a área de transferência
   */
  const copyToClipboard = useCallback((jsonType) => {
    try {
      if (!finalJson || !finalJson[jsonType]) {
        const errorMsg = 'Não foi possível copiar. JSON não disponível.';
        setError(errorMsg);
        
        // Mostrar alerta de erro - FIXED with setTimeout
        if (alert && typeof alert.error === 'function') {
          setTimeout(() => {
            alert.error(errorMsg, {
              position: 'top-center'
            });
          }, 0);
        }
        
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(finalJson[jsonType], null, 2))
        .then(() => {
          const successMsg = `JSON para ${jsonType === 'createTemplate' ? 'criação do template' : jsonType === 'sendTemplate' ? 'envio do template' : 'integração com Builder'} copiado!`;
          setSuccess(successMsg);
          
          // Mostrar alerta de sucesso - FIXED with setTimeout
          if (alert && typeof alert.success === 'function') {
            setTimeout(() => {
              alert.success(successMsg, {
                position: 'bottom-right',
                autoCloseTime: 3000
              });
            }, 0);
          }
          
          // Limpar a mensagem de sucesso após 3 segundos
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        })
        .catch(err => {
          const errorMsg = `Erro ao copiar: ${err.message}`;
          setError(errorMsg);
          
          // Mostrar alerta de erro - FIXED with setTimeout
          if (alert && typeof alert.error === 'function') {
            setTimeout(() => {
              alert.error(errorMsg, {
                position: 'top-center'
              });
            }, 0);
          }
        });
    } catch (err) {
      const errorMsg = `Erro ao copiar: ${err.message}`;
      setError(errorMsg);
      
      // Mostrar alerta de erro - FIXED with setTimeout
      if (alert && typeof alert.error === 'function') {
        setTimeout(() => {
          alert.error(errorMsg, {
            position: 'top-center'
          });
        }, 0);
      }
    }
  }, [finalJson, alert]);
  
  /**
   * Reinicia o formulário para criar um novo template
   */
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
      
      // Mostrar alerta de reset - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info('Template resetado. Você pode começar um novo template agora.', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }, 0);
      }
    }
  }, [alert]);

  /**
   * Vai para o passo anterior no fluxo
   */
  const goToPreviousStep = useCallback(() => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setError('');
      setSuccess('');
      
      // Mostrar alerta de navegação - FIXED with setTimeout
      if (alert && typeof alert.info === 'function') {
        setTimeout(() => {
          alert.info(`Retornando para o passo ${step - 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }, 0);
      }
    }
  }, [step, alert]);

  /**
   * Limpa as mensagens de erro e sucesso
   */
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Atualizar os campos de texto com limpeza de validação
  const handleInputChange = useCallback((field, value) => {
    setHasInteracted(true);

    switch (field) {
      case 'templateName':
        setTemplateName(value);
        break;
      case 'bodyText':
        setBodyText(value);
        break;
      case 'language':
        setLanguage(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'authKey':
        setAuthKey(value);
        break;
      default:
        break;
    }
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

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
    
    // Novas funções para sincronização de botões
    checkButtonConsistency,
    standardizeButtons,
    applyButtonStandardization,
    syncButtonType,
    syncAddButton,
    syncRemoveButton,

    hasInteracted,
    setHasInteracted
  };
};