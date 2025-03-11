// hooks/template/useTemplatePersistence.js
import { useState, useCallback } from 'react';
import { uploadFiles, createTemplate, sendTemplateMessage } from '../../services/api/apiService';
import { validateTemplate, validatePhoneNumber } from '../../services/validation/validationService';
import { handleApiError } from '../../utils/errorHandler';
import { loadDraft } from '../../services/storage/localStorageService';

export const useTemplatePersistence = (state, validation, draftManager, cardManagement) => {
  const {
    cards, numCards, authKey, templateName, language, bodyText, phoneNumber,
    setStep, setLoading, setError, setSuccess, setUploadResults, setFinalJson,
    alert
  } = state;

  const { validateStepOne, validateStepTwo, showValidationErrors } = validation;
  const { saveCurrentState } = draftManager;
  const { updateCard } = cardManagement;

  // Realizar upload de arquivos
  const handleUploadFiles = useCallback(async () => {
    // Validar antes de prosseguir
    if (!validateStepOne(true)) {
      setError('Por favor, corrija os erros antes de continuar.');
      return;
    }

    // Salvar o estado atual antes de fazer uploads
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
  }, [
    authKey, cards, numCards, validateStepOne, saveCurrentState, 
    updateCard, setError, setSuccess, setLoading, setUploadResults, setStep, alert
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
  }, [
    templateName, language, bodyText, authKey, cards, numCards,
    validateStepTwo, saveCurrentState, showValidationErrors,
    setLoading, setError, setSuccess, setFinalJson, setStep, alert
  ]);
  
  // Enviar o template para um número de telefone
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
      
      if (!state.finalJson || !state.finalJson.sendTemplate) {
        throw new Error('Template não disponível para envio. Por favor, complete a etapa 2 primeiro.');
      }
      
      // Enviar template
      await sendTemplateMessage(formattedPhone, state.finalJson.sendTemplate, authKey);
      
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
  }, [
    phoneNumber, state.finalJson, authKey, 
    setLoading, setError, setSuccess, alert
  ]);
  
  // Copiar o JSON do template para a área de transferência
  const copyToClipboard = useCallback((jsonType) => {
    try {
      if (!state.finalJson || !state.finalJson[jsonType]) {
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
      
      navigator.clipboard.writeText(JSON.stringify(state.finalJson[jsonType], null, 2))
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
  }, [state.finalJson, setError, setSuccess, alert]);

  return {
    handleUploadFiles,
    handleCreateTemplate,
    sendTemplate,
    copyToClipboard
  };
};