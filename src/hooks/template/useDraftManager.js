// hooks/template/useDraftManager.js
import { useCallback, useEffect } from 'react';
import { saveDraft, loadDraft, clearDraft } from '../../services/storage/localStorageService';

export const useDraftManager = (state) => {
  const {
    templateName, language, bodyText, cards, authKey,
    numCards, step, draftLoadedRef,
    setLastSavedTime, setUnsavedChanges,
    setTemplateName, setLanguage, setBodyText, setAuthKey,
    setCards, setNumCards, alert
  } = state;

  // Carregar rascunho na inicialização
  useEffect(() => {
    // Evitar carregamentos múltiplos
    if (draftLoadedRef.current) return;
    
    const loadSavedData = () => {
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
        
        console.log('Cards carregados do rascunho:', numCardsToSet);
        console.log('Cards com fileHandles:', processedCards.filter(c => c.fileHandle).length);
        
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
  }, [
    draftLoadedRef, setTemplateName, setLanguage, setBodyText, setAuthKey,
    setCards, setNumCards, setLastSavedTime, alert, state.createEmptyCard
  ]);

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

  // Manipulador para botão explícito de salvar
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
    clearDraft
  };
};