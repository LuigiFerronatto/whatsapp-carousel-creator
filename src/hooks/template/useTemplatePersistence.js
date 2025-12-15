// hooks/template/useTemplatePersistence.js - Com AlertService
import { useState, useCallback } from 'react';
import { uploadFiles, createTemplate, sendTemplateMessage } from '../../services/api/apiService';
import { validateTemplate, validatePhoneNumber } from '../../services/validation/validationService';
import { handleApiError } from '../../utils/errorHandler';
import { loadDraft, saveDraft } from '../../services/storage/localStorageService';
import { useAlertService } from '../common/useAlertService';

export const useTemplatePersistence = (state, validation, draftManager, cardManagement) => {
  const {
    cards, numCards, authKey, templateName, language, bodyText, phoneNumber,
    setStep, setLoading, setError, setSuccess, setUploadResults, setFinalJson
  } = state;

  const { validateStepOne, validateStepTwo, showValidationErrors } = validation;
  const { saveCurrentState } = draftManager;
  const { updateCard } = cardManagement;
  
  // Usar AlertService em vez de alert direto
  const alertService = useAlertService();

  // Realizar upload de arquivos
  const handleUploadFiles = useCallback(async () => {
    // Validar antes de prosseguir
    if (!validateStepOne(true)) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }

    // CORREÇÃO: Salvar o estado atual com o número correto de cards antes de fazer uploads
    // Isso garante que o localStorage tenha exatamente o mesmo número de cards que o estado atual
    const currentState = {
      templateName,
      language,
      bodyText,
      cards: cards.slice(0, numCards), // Apenas os cards ativos
      authKey,
      numCards,
      step: state.step,
      lastSavedTime: new Date()
    };
    
    // Salvar diretamente no localStorage (além de usar saveCurrentState)
    saveDraft(currentState);
  
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mostrar alerta de início do processo
      alertService.info('UPLOAD_STARTED');
      
      setSuccess('Iniciando processo de upload...');
      
      // CORREÇÃO: Obter APENAS os cards ativos atuais, limitando ao numCards
      const activeCards = cards.slice(0, numCards);
      console.log(`Processando ${activeCards.length} cards ativos`);
      
      // Carregar o rascunho mais recente para obter os fileHandles mais atualizados
      const savedDraft = loadDraft();
      
      // CORREÇÃO: Garantir que usamos apenas os cards correspondentes aos ativos
      // Se o rascunho tiver mais ou menos cards do que o atual, isso evita problemas
      const savedCards = savedDraft?.cards || [];
      console.log(`Rascunho salvo tem ${savedCards.length} cards`);
      
      // Cards que já têm fileHandle e URL não mudou (podem pular upload)
      const cardsWithValidHandles = [];
      // Cards que precisam de upload
      const cardsToUpload = [];
      
      // Verificar cada card atual
      activeCards.forEach((card, index) => {
        // Se não tem URL, pular
        if (!card.fileUrl) return;
        
        // Verificar se existe um card salvo correspondente
        // CORREÇÃO: Apenas considerar o card salvo se o índice estiver dentro dos limites
        const savedCard = index < savedCards.length ? savedCards[index] : null;
        
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
          cardsToUpload.push({...card, index}); // Guardar o índice original
        }
      });
      
      console.log('Cards com fileHandles válidos:', cardsWithValidHandles.length);
      console.log('Cards que precisam de upload:', cardsToUpload.length);
      
      // Resultados finais combinados
      let finalResults = [];
      
      // Adicionar resultados dos cards que já têm fileHandle
      cardsWithValidHandles.forEach(card => {
        const cardIndex = activeCards.findIndex(c => c.fileUrl === card.fileUrl);
        finalResults.push({
          fileHandle: card.fileHandle,
          status: 'cached', // Status especial para indicar que foi carregado do cache
          cardIndex: cardIndex
        });
      });
      
      // Se houver cards para upload, fazer o upload
      if (cardsToUpload.length > 0) {
        // CORREÇÃO: Remover o índice antes de enviar para upload
        const cardsForApi = cardsToUpload.map(({index, ...rest}) => rest);
        
        // Fazer upload dos arquivos que precisam
        const newResults = await uploadFiles(cardsForApi, authKey);
        
        // Mapear resultados aos índices originais dos cards
        for (let i = 0; i < newResults.length; i++) {
          const result = newResults[i];
          // CORREÇÃO: Usar o índice que guardamos
          const originalIndex = cardsToUpload[i].index;
          
          // Adicionar o índice original ao resultado
          result.cardIndex = originalIndex;
          
          // Atualizar o card com o fileHandle recebido se o resultado for de sucesso
          if (result.status === 'success' && result.fileHandle) {
            updateCard(originalIndex, 'fileHandle', result.fileHandle);
          }
          
          // Adicionar ao array de resultados finais
          finalResults.push(result);
        }
      }
      
      // Ordenar resultados pelo índice original
      finalResults.sort((a, b) => a.cardIndex - b.cardIndex);
      
      // Definir os resultados de upload
      setUploadResults(finalResults);
      
      // CORREÇÃO: Salvar novamente o estado APÓS todas as atualizações
      // Isso garante que todos os fileHandles estão preservados
      // e que o número de cards no localStorage corresponde ao estado atual
      saveCurrentState();
      
      // Mensagem de sucesso baseada em quantos arquivos foram processados
      const skippedCount = cardsWithValidHandles.length;
      let successMessage = '';

      if (cardsToUpload.length > 0 && skippedCount > 0) {
        successMessage = `${cardsToUpload.length} arquivo(s) enviado(s) e ${skippedCount} carregado(s) do cache`;
        alertService.success('UPLOAD_PARTIAL', {}, cardsToUpload.length, skippedCount);
      } else if (cardsToUpload.length > 0) {
        successMessage = `${cardsToUpload.length} arquivo(s) enviado(s) com sucesso`;
        alertService.success('UPLOAD_COMPLETE', {}, cardsToUpload.length);
      } else if (skippedCount > 0) {
        successMessage = `${skippedCount} arquivo(s) carregado(s) do cache`;
        alertService.success('UPLOAD_CACHE_USED', {}, skippedCount);
      } else {
        successMessage = 'Nenhum arquivo precisava ser processado';
        alertService.info(successMessage);
      }
      
      setSuccess(successMessage);

      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      // Avançar para a próxima etapa
      setStep(2);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Mostrar alerta de erro
      alertService.error('UPLOAD_ERROR', {}, errorMessage);
      
      console.error('Erro durante o processo de upload:', err);
    } finally {
      setLoading(false);
    }
  }, [
    authKey, cards, numCards, validateStepOne, saveCurrentState, 
    updateCard, setError, setSuccess, setLoading, setUploadResults, setStep, alertService,
    templateName, language, bodyText, state.step
  ]);

  // Criar o template
  const handleCreateTemplate = useCallback(async () => {
    // Validar antes de prosseguir
    const errors = validateStepTwo();
    if (errors.length > 0) {
      setError('Por favor, corrija os erros antes de continuar.');
      showValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Usar a versão mais recente dos cards
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
      
      // Mostrar alerta de sucesso
      alertService.success('TEMPLATE_CREATED');
      
      // Avançar para a próxima etapa
      setStep(3);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Mostrar alerta de erro
      alertService.error('TEMPLATE_CREATION_ERROR', {}, errorMessage);
      
      console.error('Erro ao criar template:', err);
    } finally {
      setLoading(false);
    }
  }, [
    templateName, language, bodyText, authKey, cards, numCards,
    validateStepTwo, saveCurrentState, showValidationErrors,
    setLoading, setError, setSuccess, setFinalJson, setStep, alertService
  ]);
  
  // Enviar o template para um número de telefone
  const sendTemplate = useCallback(async (phoneNumberToSend = phoneNumber) => {
    // Verificar se temos um número de telefone
    if (!phoneNumberToSend) {
      setError('Número de telefone é obrigatório para enviar o template');
      alertService.error('PHONE_REQUIRED');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      // Mostrar alerta de envio
      alertService.info(`Enviando template para ${phoneNumberToSend}...`);
      
      const formattedPhone = validatePhoneNumber(phoneNumberToSend);
      
      if (!state.finalJson || !state.finalJson.sendTemplate) {
        throw new Error('Template não disponível para envio. Por favor, complete a etapa 2 primeiro.');
      }
      
      // Enviar template
      await sendTemplateMessage(formattedPhone, state.finalJson.sendTemplate, authKey);
      
      const successMsg = `Template enviado com sucesso para ${phoneNumberToSend}!`;
      
      // Definir o sucesso
      setSuccess(successMsg);
      
      // Mostrar alerta de sucesso
      alertService.success('TEMPLATE_SENT', {}, phoneNumberToSend);
      
      // Limpar o sucesso após 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      alertService.error('TEMPLATE_SEND_ERROR', {}, errorMessage);
      
      console.error("Erro no envio:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    phoneNumber, state.finalJson, authKey, 
    setLoading, setError, setSuccess, alertService
  ]);
  
  // Copiar o JSON do template para a área de transferência
  const copyToClipboard = useCallback((jsonType) => {
    try {
      if (!state.finalJson || !state.finalJson[jsonType]) {
        setError('Não foi possível copiar. JSON não disponível.');
        alertService.error('JSON_NOT_AVAILABLE', {}, jsonType);
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(state.finalJson[jsonType], null, 2))
        .then(() => {
          const successMsg = `JSON para ${jsonType === 'createTemplate' ? 'criação do template' : jsonType === 'sendTemplate' ? 'envio do template' : 'integração com Builder'} copiado!`;
          setSuccess(successMsg);
          
          // Mostrar alerta de sucesso
          alertService.success('JSON_COPIED', {}, jsonType);
          
          // Limpar a mensagem de sucesso após 3 segundos
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        })
        .catch(err => {
          setError(`Erro ao copiar: ${err.message}`);
          alertService.error(`Erro ao copiar: ${err.message}`);
        });
    } catch (err) {
      setError(`Erro ao copiar: ${err.message}`);
      alertService.error(`Erro ao copiar: ${err.message}`);
    }
  }, [state.finalJson, setError, setSuccess, alertService]);

  return {
    handleUploadFiles,
    handleCreateTemplate,
    sendTemplate,
    copyToClipboard
  };
};