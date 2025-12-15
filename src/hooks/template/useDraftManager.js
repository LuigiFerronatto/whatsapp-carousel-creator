// Modificação do src/hooks/template/useDraftManager.js

import { useCallback, useEffect } from 'react';
import { saveDraft, loadDraft, clearDraft, getDraftInfo } from '../../services/storage/localStorageService';

export const useDraftManager = (state) => {
  const {
    templateName, language, bodyText, cards, authKey,
    numCards, step, draftLoadedRef,
    setLastSavedTime, setUnsavedChanges,
    setTemplateName, setLanguage, setBodyText, setAuthKey,
    setCards, setNumCards, alert
  } = state;

  // Verificar se há um rascunho salvo e mostrar opção para o usuário
  useEffect(() => {
    // Evitar verificações múltiplas
    if (draftLoadedRef.current) return;
    
    const checkForDraft = () => {
      try {
        // Verificar se existe um rascunho e se ele ainda é válido
        const draftInfo = getDraftInfo();
        
        if (!draftInfo) return;
        
        // Verificar se o rascunho expirou (24 horas)
        const currentTime = new Date().getTime();
        const draftTime = new Date(draftInfo.lastSavedTime).getTime();
        const timeDiff = currentTime - draftTime;
        const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 horas
        
        if (timeDiff > EXPIRY_TIME) {
          // Rascunho expirado, remover automaticamente
          clearDraft();
          console.log('Rascunho expirado e removido automaticamente');
          return;
        }
        
        // Perguntar ao usuário se deseja carregar o rascunho anterior
        const confirmation = window.confirm(
          `Foi encontrado um rascunho de template salvo de ${new Date(draftInfo.lastSavedTime).toLocaleString()}.\n\n` +
          `Nome: ${draftInfo.templateName || 'Sem nome'}\n` +
          `Cards: ${draftInfo.numCards || 0}\n\n` +
          `Deseja carregar este rascunho? Clique em Cancelar para começar um novo template.`
        );
        
        if (confirmation) {
          // Carregar o rascunho salvo
          loadSavedDraft();
        } else {
          // Limpar o rascunho e começar novo
          clearDraft();
          console.log('Usuário optou por não carregar o rascunho anterior');
        }
        
        // Marcar como verificado
        draftLoadedRef.current = true;
      } catch (error) {
        console.error('Erro ao verificar rascunho:', error);
        draftLoadedRef.current = true;
      }
    };
    
    // Usar setTimeout para garantir que a UI seja renderizada primeiro
    setTimeout(checkForDraft, 500);
  }, [draftLoadedRef]);

  // Função para carregar o rascunho salvo
  const loadSavedDraft = useCallback(() => {
    try {
      const savedDraft = loadDraft();
      if (!savedDraft) return;
      
      // Verificar se o rascunho tem dados essenciais
      if (!savedDraft.cards || savedDraft.cards.length < 2) {
        console.warn('Rascunho incompleto ou inválido encontrado. Ignorando.');
        return;
      }
      
      // Aplicar dados salvos com verificações adicionais
      if (savedDraft.templateName) setTemplateName(savedDraft.templateName);
      if (savedDraft.language) setLanguage(savedDraft.language);
      if (savedDraft.bodyText) setBodyText(savedDraft.bodyText);
      if (savedDraft.authKey) setAuthKey(savedDraft.authKey);
      
      // Aplicar cards salvos com validação adicional
      const processedCards = savedDraft.cards.map(card => ({
        ...state.createEmptyCard(), // Base com valores padrão
        ...card, // Sobrescrever com valores salvos
        fileHandle: card.fileHandle || '',
        buttons: card.buttons && card.buttons.length > 0 
          ? card.buttons 
          : [{ type: 'QUICK_REPLY', text: '', payload: '' }]
      }));
      
      // Garantir que temos pelo menos 2 cards
      while (processedCards.length < 2) {
        processedCards.push(state.createEmptyCard());
      }
      
      // Definir o número correto de cards
      const numCardsToSet = Math.max(2, Math.min(savedDraft.numCards || 2, processedCards.length));
      
      setCards(processedCards);
      setNumCards(numCardsToSet);
      
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
      }, 0);
      
      return true;
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
      return false;
    }
  }, [setTemplateName, setLanguage, setBodyText, setAuthKey,
      setCards, setNumCards, setLastSavedTime, alert, state.createEmptyCard]);

  // Limpar o rascunho ao finalizar a criação do template
  useEffect(() => {
    // Quando o usuário chega ao passo 3 (template finalizado), limpar o rascunho
    if (step === 3) {
      // Esperar um pouco para garantir que os dados foram processados
      setTimeout(() => {
        clearDraft();
        console.log('Template criado com sucesso, rascunho limpo automaticamente');
      }, 2000);
    }
  }, [step]);

  // Salvar o estado atual no localStorage
  const saveCurrentState = useCallback(() => {
    // Criar objeto com estado atual, limitando apenas aos cards ativos
    const state = {
      templateName,
      language,
      bodyText,
      cards: cards.slice(0, numCards), // Salvar apenas os cards ativos
      authKey,
      numCards,
      step,
      lastSavedTime: new Date()
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
  }, [
    templateName, language, bodyText, cards, authKey, 
    numCards, step, setLastSavedTime, setUnsavedChanges
  ]);

  // Função para salvar explicitamente (botão Salvar)
  const handleSaveBeforeUpload = useCallback(() => {
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
    saveCurrentState,
    handleSaveBeforeUpload,
    loadSavedDraft,
    clearDraft
  };
};