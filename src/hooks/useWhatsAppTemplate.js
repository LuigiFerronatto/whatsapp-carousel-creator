// hooks/useWhatsAppTemplate.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { validateTemplate, validatePhoneNumber } from '../services/validation/validationService';
import { uploadFiles, createTemplate, sendTemplateMessage } from '../services/api/apiService';
import { saveDraft, loadDraft, clearDraft } from '../services/storage/localStorageService';
import { handleApiError } from '../utils/errorHandler';

/**
 * Hook aprimorado para gerenciar o estado e as operações do criador de templates de carrossel
 * @returns {Object} Estado e métodos para gerenciar o fluxo do criador de carrossel
 */
export const useWhatsAppTemplate = () => {
  // Estados de fluxo
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  // Estados de autenticação e configuração
  const [authKey, setAuthKey] = useState('');
  
  // Estados do template
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('pt_BR');
  const [bodyText, setBodyText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Estados de cards
  const [numCards, setNumCards] = useState(2);
  const [cards, setCards] = useState([
    createEmptyCard(),
    createEmptyCard()
  ]);
  
  // Estados de resultados
  const [uploadResults, setUploadResults] = useState([]);
  const [finalJson, setFinalJson] = useState({});
  
  // Referência para o autosave
  const autoSaveTimerRef = useRef(null);
  
  // Função auxiliar para criar um card vazio
  function createEmptyCard() {
    return {
      fileUrl: '',
      fileType: 'image',
      fileHandle: '',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: '', payload: '' }]
    };
  }
  
  // Função para salvar o estado atual - IMPORTANTE: deve ser definida antes do useEffect que a utiliza
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
  
  // Função para salvar manualmente o rascunho
  const saveDraftManually = useCallback(() => {
    const saveSuccess = saveCurrentState();
    
    if (saveSuccess) {
      setSuccess('Rascunho salvo com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Erro ao salvar rascunho. Verifique o espaço disponível no seu navegador.');
      setTimeout(() => setError(''), 5000);
    }
  }, [saveCurrentState]);
  
  // Carregar rascunho salvo ao iniciar
  useEffect(() => {
    const savedDraft = loadDraft();
    if (savedDraft) {
      // Restaurar estado salvo
      if (savedDraft.templateName) setTemplateName(savedDraft.templateName);
      if (savedDraft.language) setLanguage(savedDraft.language);
      if (savedDraft.bodyText) setBodyText(savedDraft.bodyText);
      if (savedDraft.cards && savedDraft.cards.length) {
        setCards(savedDraft.cards);
        setNumCards(savedDraft.cards.length);
      }
      if (savedDraft.authKey) setAuthKey(savedDraft.authKey);
      if (savedDraft.lastSavedTime) setLastSavedTime(new Date(savedDraft.lastSavedTime));
      
      setSuccess('Rascunho carregado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    }
  }, []);
  
  // Configurar alerta para prevenir o usuário de sair com alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);
  
  // Autosave quando houver mudanças - AGORA usando saveCurrentState que já foi definida
  useEffect(() => {
    // Marcar que existem mudanças não salvas - apenas se não estiver já marcado
    if (!unsavedChanges) {
      setUnsavedChanges(true);
    }
    
    // Limpar timer anterior se existir
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Configurar novo timer para autosave (30 segundos)
    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentState();
    }, 30000);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [templateName, language, bodyText, cards, authKey, unsavedChanges, saveCurrentState]);
  
  // Funções de validação para cada etapa
  const validateStepOne = useCallback(() => {
    const errors = {};
    
    if (!authKey) {
      errors.authKey = 'A chave de autorização (Router Key) é obrigatória';
    }
    
    // Removida a variável cardErrors que não era utilizada
    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.fileUrl) {
        errors[`card_${index}_fileUrl`] = `URL do arquivo não informada para o card ${index + 1}`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [authKey, cards, numCards]);
  
  const validateStepTwo = useCallback(() => {
    const errors = {};
    
    if (!templateName) {
      errors.templateName = 'Nome do template é obrigatório';
    } else if (templateName.length < 3) {
      errors.templateName = 'Nome do template deve ter pelo menos 3 caracteres';
    }
    
    if (!bodyText) {
      errors.bodyText = 'Texto do corpo da mensagem é obrigatório';
    } else if (bodyText.length > 1024) {
      errors.bodyText = `Texto do corpo excede o limite de 1024 caracteres. Atual: ${bodyText.length}`;
    }
    
    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.bodyText) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} é obrigatório`;
      } else if (card.bodyText.length > 160) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} excede o limite de 160 caracteres`;
      }
      
      if (!card.buttons || card.buttons.length === 0) {
        errors[`card_${index}_buttons`] = `Adicione pelo menos um botão para o card ${index + 1}`;
      } else {
        card.buttons.forEach((button, btnIndex) => {
          if (!button.text) {
            errors[`card_${index}_button_${btnIndex}_text`] = `Texto do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
          }
          
          if (button.type === 'URL' && !button.url) {
            errors[`card_${index}_button_${btnIndex}_url`] = `URL do botão ${btnIndex + 1} no card ${index + 1} é obrigatória`;
          }
          
          if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
            errors[`card_${index}_button_${btnIndex}_phoneNumber`] = `Número de telefone do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
          }
        });
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [templateName, bodyText, cards, numCards]);
  
  const validateStepThree = useCallback(() => {
    const errors = {};
    
    if (!phoneNumber) {
      errors.phoneNumber = 'Número de telefone é obrigatório para enviar o template';
    } else {
      try {
        validatePhoneNumber(phoneNumber);
      } catch (err) {
        errors.phoneNumber = err.message;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [phoneNumber]);
  
  // Verificar se a etapa atual é válida
  const isStepValid = useCallback((currentStep) => {
    switch(currentStep) {
      case 1:
        return validateStepOne();
      case 2:
        return validateStepTwo();
      case 3:
        return validateStepThree();
      default:
        return true;
    }
  }, [validateStepOne, validateStepTwo, validateStepThree]);
  
  /**
   * Verifica a consistência dos botões entre todos os cards
   * @returns {Object} Informações sobre a consistência dos botões
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
   * @returns {Array} Array de cards com botões padronizados
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
    setTimeout(() => setSuccess(''), 3000);
  }, [standardizeButtons]);

  /**
   * Sincroniza um tipo de botão em todos os cards
   * @param {number} buttonIndex Índice do botão a ser sincronizado
   * @param {string} newType Novo tipo de botão
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
  }, [numCards]);

  /**
   * Sincroniza a adição de botões em todos os cards
   * @param {number} cardIndex Índice do card onde o botão foi adicionado
   * @param {Object} buttonType Tipo do novo botão
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
  }, [numCards]);

  /**
   * Sincroniza a remoção de botões em todos os cards
   * @param {number} buttonIndex Índice do botão a ser removido
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
  }, [numCards]);
  
  /**
   * Adiciona um novo card ao template
   */
  const handleAddCard = useCallback(() => {
    if (numCards < 10) {
      setNumCards(prev => prev + 1);
      setCards(prev => [...prev, createEmptyCard()]);
    }
  }, [numCards]);
  
  /**
   * Remove o último card do template
   */
  const handleRemoveCard = useCallback(() => {
    if (numCards > 2) {
      setNumCards(prev => prev - 1);
      setCards(prev => prev.slice(0, prev.length - 1));
    }
  }, [numCards]);
  
  /**
   * Atualiza um campo específico de um card
   * @param {number} index - Índice do card a ser atualizado
   * @param {string} field - Nome do campo a ser atualizado
   * @param {any} value - Novo valor do campo
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
   * @param {number} cardIndex - Índice do card
   * @param {number} buttonIndex - Índice do botão
   * @param {string} field - Nome do campo a ser atualizado
   * @param {any} value - Novo valor do campo
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
   * @param {number} cardIndex - Índice do card
   */
  const addButton = useCallback((cardIndex) => {
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
    }
  }, [cards, numCards, syncAddButton]);
  
  /**
   * Remove um botão de um card
   * @param {number} cardIndex - Índice do card
   * @param {number} buttonIndex - Índice do botão a ser removido
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
    }
  }, [numCards, syncRemoveButton]);
  
  /**
   * Faz o upload dos arquivos dos cards para a API
   */
  const handleUploadFiles = useCallback(async () => {
    // Validar antes de prosseguir
    if (!validateStepOne()) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Iniciando processo de upload...');
      
      // Fazer upload dos arquivos
      const results = await uploadFiles(cards.slice(0, numCards), authKey);
      
      // Atualizar os cards com os handles recebidos
      results.forEach((result, index) => {
        updateCard(index, 'fileHandle', result.fileHandle);
      });
      
      setUploadResults(results);
      setSuccess(`Todos os ${numCards} arquivos foram processados com sucesso!`);
      
      // Salvar o estado atual
      saveCurrentState();
      
      // Avançar para a próxima etapa
      setStep(2);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Erro durante o processo de upload:', err);
    } finally {
      setLoading(false);
    }
  }, [authKey, cards, numCards, updateCard, validateStepOne, saveCurrentState]);
  
  /**
   * Cria o template baseado nas informações fornecidas
   * com padronização automática de botões para atender aos requisitos do WhatsApp
   */
  const handleCreateTemplate = useCallback(async () => {
    // Validar antes de prosseguir
    if (!validateStepTwo()) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }
    
    // Verificar consistência de botões
    const consistency = checkButtonConsistency();
    
    // Se não for consistente, padronizar os botões antes de prosseguir
    if (!consistency.isConsistent) {
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
        return;
      }
      
      // Se não tiver campos vazios obrigatórios, prosseguir com os cards padronizados
      setCards(standardizedCards);
      
      // Informar ao usuário sobre a padronização
      setSuccess('Botões padronizados automaticamente para atender aos requisitos do WhatsApp.');
      
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
      
      // Salvar o estado atual
      saveCurrentState();
      
      // Avançar para a próxima etapa
      setStep(3);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Erro ao criar template:', err);
    } finally {
      setLoading(false);
    }
  }, [templateName, language, bodyText, authKey, cards, numCards, validateStepTwo, saveCurrentState, checkButtonConsistency, standardizeButtons]);
  
  /**
   * Envia o template para um número de telefone
   */
  const sendTemplate = useCallback(async () => {
    // Validar antes de prosseguir
    if (!validateStepThree()) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPhone = validatePhoneNumber(phoneNumber);
      
      // Validar template
      if (!finalJson || !finalJson.sendTemplate) {
        throw new Error('Template não disponível para envio. Por favor, complete a etapa 2 primeiro.');
      }
      
      // Enviar template
      await sendTemplateMessage(formattedPhone, finalJson.sendTemplate, authKey);
      
      setSuccess(`Template enviado com sucesso para ${phoneNumber}!`);
      
      // Avançar para a próxima etapa
      setStep(4);
    } catch (err) {
      setError(handleApiError(err));
      console.error("Erro no envio:", err);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, finalJson, authKey, validateStepThree]);
  
  /**
   * Copia o JSON do template para a área de transferência
   * @param {string} jsonType - Tipo de JSON a ser copiado ('createTemplate' ou 'sendTemplate')
   */
  const copyToClipboard = useCallback((jsonType) => {
    try {
      if (!finalJson || !finalJson[jsonType]) {
        setError('Não foi possível copiar. JSON não disponível.');
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(finalJson[jsonType], null, 2))
        .then(() => {
          setSuccess(`JSON para ${jsonType === 'createTemplate' ? 'criação do template' : 'envio do template'} copiado!`);
          
          // Limpar a mensagem de sucesso após 3 segundos
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        })
        .catch(err => {
          setError(`Erro ao copiar: ${err.message}`);
        });
    } catch (err) {
      setError(`Erro ao copiar: ${err.message}`);
    }
  }, [finalJson]);
  
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
    }
  }, []);

  /**
   * Vai para o passo anterior no fluxo
   */
  const goToPreviousStep = useCallback(() => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setError('');
      setSuccess('');
    }
  }, [step]);

  /**
   * Limpa as mensagens de erro e sucesso
   */
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Atualizar os campos de texto com limpeza de validação
  const handleInputChange = useCallback((field, value) => {
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
    saveDraftManually,
    
    // Novas funções para sincronização de botões
    checkButtonConsistency,
    standardizeButtons,
    applyButtonStandardization,
    syncButtonType,
    syncAddButton,
    syncRemoveButton
  };
};