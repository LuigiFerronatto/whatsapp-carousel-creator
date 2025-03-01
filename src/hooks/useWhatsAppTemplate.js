// hooks/useWhatsAppTemplate.js
import { useState, useCallback, useEffect } from 'react';
import { validateTemplate, validatePhoneNumber } from '../services/validation/validationService';
import { uploadFiles, createTemplate, sendTemplateMessage } from '../services/api/apiService';
import { saveDraft, loadDraft } from '../services/storage/localStorageService';
import { handleApiError } from '../utils/errorHandler';

/**
 * Hook principal que gerencia o estado e as operações do criador de templates de carrossel
 * @returns {Object} Estado e métodos para gerenciar o fluxo do criador de carrossel
 */
export const useWhatsAppTemplate = () => {
  // Estados de fluxo
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
  
  // Função auxiliar para criar um card vazio
  function createEmptyCard() {
    return {
      fileUrl: '',
      fileType: 'image',
      fileHandle: '',
      bodyText: '',
      buttons: [{ type: 'URL', text: '', url: '' }]
    };
  }
  
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
    }
  }, []);
  
  // Salvar rascunho quando houver mudanças importantes
  useEffect(() => {
    saveDraft({
      templateName,
      language,
      bodyText,
      cards,
      authKey
    });
  }, [templateName, language, bodyText, cards, authKey]);
  
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
  }, []);
  
  /**
   * Faz o upload dos arquivos dos cards para a API
   */
  const handleUploadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!authKey) throw new Error('A chave de autorização (Router Key) é obrigatória');
      
      // Verificar URLs dos arquivos
      cards.slice(0, numCards).forEach((card, index) => {
        if (!card.fileUrl) {
          throw new Error(`URL do arquivo não informada para o card ${index + 1}`);
        }
      });
      
      setSuccess('Iniciando processo de upload...');
      
      // Fazer upload dos arquivos
      const results = await uploadFiles(cards.slice(0, numCards), authKey);
      
      // Atualizar os cards com os handles recebidos
      results.forEach((result, index) => {
        updateCard(index, 'fileHandle', result.fileHandle);
      });
      
      setUploadResults(results);
      setSuccess(`Todos os ${numCards} arquivos foram processados com sucesso!`);
      setStep(2);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Erro durante o processo de upload:', err);
    } finally {
      setLoading(false);
    }
  }, [authKey, cards, numCards, updateCard]);
  
  /**
   * Cria o template baseado nas informações fornecidas
   */
  const handleCreateTemplate = useCallback(async () => {
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
      setStep(3);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Erro ao criar template:', err);
    } finally {
      setLoading(false);
    }
  }, [templateName, language, bodyText, authKey, cards, numCards]);
  
  /**
   * Envia o template para um número de telefone
   */
  const sendTemplate = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar número de telefone
      if (!phoneNumber) {
        throw new Error('Número de telefone é obrigatório para enviar o template');
      }
      
      const formattedPhone = validatePhoneNumber(phoneNumber);
      
      // Validar template
      if (!finalJson || !finalJson.sendTemplate) {
        throw new Error('Template não disponível para envio. Por favor, complete a etapa 2 primeiro.');
      }
      
      // Enviar template
      await sendTemplateMessage(formattedPhone, finalJson.sendTemplate, authKey);
      
      setSuccess(`Template enviado com sucesso para ${phoneNumber}!`);
      
      // Opcionalmente, avançar para a próxima etapa
      setStep(4);
    } catch (err) {
      setError(handleApiError(err));
      console.error("Erro no envio:", err);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, finalJson, authKey]);
  
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
    setStep(1);
    setCards(Array(2).fill().map(() => createEmptyCard()));
    setNumCards(2);
    setTemplateName('');
    setBodyText('');
    setFinalJson({});
    setPhoneNumber('');
    setError('');
    setSuccess('');
    // Manter o authKey para facilitar novos envios
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

  /**
   * Valida se o formulário atual está preenchido corretamente
   * @param {number} currentStep - Passo atual do fluxo
   * @returns {boolean} Verdadeiro se o formulário estiver válido
   */
  const isStepValid = useCallback((currentStep) => {
    switch (currentStep) {
      case 1:
        return !!authKey && cards.every(card => !!card.fileUrl);
      case 2:
        return !!templateName && !!bodyText && cards.every(card => 
          !!card.bodyText && card.buttons.every(button => 
            !!button.text && (button.type !== 'URL' || !!button.url) && 
            (button.type !== 'PHONE_NUMBER' || !!button.phoneNumber)
          )
        );
      case 3:
        return !!finalJson.createTemplate && !!finalJson.sendTemplate;
      default:
        return true;
    }
  }, [authKey, cards, templateName, bodyText, finalJson]);

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
    
    // Métodos
    handleAddCard,
    handleRemoveCard,
    updateCard,
    handleUploadFiles,
    handleCreateTemplate,
    sendTemplate,
    copyToClipboard,
    resetForm,
    goToPreviousStep,
    clearMessages,
    isStepValid
  };
};