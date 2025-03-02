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
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[`card_${cardIndex}_button_${buttonIndex}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`card_${cardIndex}_button_${buttonIndex}_${field}`];
        return newErrors;
      });
    }
  }, [validationErrors]);
  
  /**
   * Adiciona um novo botão a um card
   * @param {number} cardIndex - Índice do card
   */
  const addButton = useCallback((cardIndex) => {
    setCards(prev => {
      const newCards = [...prev];
      const newButtons = [...newCards[cardIndex].buttons, { type: 'QUICK_REPLY', text: '', payload: '' }];
      newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      return newCards;
    });
  }, []);
  
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
  }, []);
  
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
   */
  const handleCreateTemplate = useCallback(async () => {
    // Validar antes de prosseguir
    if (!validateStepTwo()) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar informações do template
      validateTemplate(templateName, bodyText, authKey, cards.slice(0, numCards));
      
      setSuccess('Validações concluídas. Criando template...');
      
      // Criar template na API
      const { templateJson, sendTemplateJson } = await createTemplate(
        templateName, 
        language, 
        bodyText, 
        cards.slice(0, numCards), 
        authKey
      );

      // Armazenar os JSONs gerados
      setFinalJson({
        createTemplate: templateJson,
        sendTemplate: sendTemplateJson
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
  }, [templateName, language, bodyText, authKey, cards, numCards, validateStepTwo, saveCurrentState]);
  
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
    cards,
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
    saveDraftManually
  };
}