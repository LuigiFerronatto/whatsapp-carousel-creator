// hooks/template/useDraftManager.js - Com AlertService
import { useCallback, useEffect } from 'react';
import { saveDraft, loadDraft, clearDraft } from '../../services/storage/localStorageService';
import { useAlertService } from '../common/useAlertService';

export const useDraftManager = (state) => {
  const {
    templateName, language, bodyText, cards, authKey,
    numCards, step, draftLoadedRef,
    setLastSavedTime, setUnsavedChanges,
    setTemplateName, setLanguage, setBodyText, setAuthKey,
    setCards, setNumCards
  } = state;

  // Usar o AlertService no lugar de alert direto
  const alertService = useAlertService();

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
        
        // CORREÇÃO: Garantir que temos array completo e consistente com o numCards do rascunho
        // Isso resolve o problema quando o usuário aumenta ou diminui o número de cards
        const savedNumCards = Math.max(2, Math.min(savedDraft.numCards || 2, 10));
        
        // Iniciar com um array completo de cards vazios
        const fullCardArray = Array(10).fill().map((_, i) => {
          // Para índices dentro do savedDraft.cards, usar o card salvo
          if (i < savedDraft.cards.length) {
            return {
              ...state.createEmptyCard(), // Base com valores padrão
              ...savedDraft.cards[i], // Sobrescrever com valores salvos
              fileHandle: savedDraft.cards[i].fileHandle || '',
              buttons: savedDraft.cards[i].buttons && savedDraft.cards[i].buttons.length > 0 
                ? savedDraft.cards[i].buttons 
                : [{ type: 'QUICK_REPLY', text: '', payload: '' }]
            };
          }
          // Para índices além do tamanho do rascunho, criar cards vazios
          return state.createEmptyCard();
        });
        
        // Definir o número correto de cards
        setCards(fullCardArray);
        setNumCards(savedNumCards);
        
        console.log(`Cards carregados do rascunho: ${savedNumCards} ativos de ${fullCardArray.length} total`);
        console.log('Cards com fileHandles:', fullCardArray.filter(c => c.fileHandle).length);
        
        // Definir último salvamento
        if (savedDraft.lastSavedTime) {
          const savedTime = typeof savedDraft.lastSavedTime === 'string' 
            ? new Date(savedDraft.lastSavedTime)
            : new Date(savedDraft.lastSavedTime);
            
          setLastSavedTime(savedTime);
        }
        
        // Mostrar confirmação ao usuário usando AlertService
        setTimeout(() => {
          alertService.info('DRAFT_LOAD_SUCCESS');
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        alertService.error('DRAFT_LOAD_ERROR');
      }
    };
    
    // Usar setTimeout para garantir que execute após a renderização inicial
    setTimeout(loadSavedData, 0);
    draftLoadedRef.current = true;
  }, [
    draftLoadedRef, setTemplateName, setLanguage, setBodyText, setAuthKey,
    setCards, setNumCards, setLastSavedTime, alertService, state.createEmptyCard
  ]);

  // Salvar o estado atual no localStorage
  const saveCurrentState = useCallback(() => {
    // CORREÇÃO: Criar objeto com estado atual limitando apenas aos cards ativos
    // Isso evita que o localStorage tenha mais cards do que o necessário
    const currentState = {
      templateName,
      language,
      bodyText,
      cards: cards.slice(0, numCards), // Salvar apenas os cards ativos
      authKey,
      numCards, // Importante salvar o numCards atual
      step,
      lastSavedTime: new Date()
    };
    
    // Log para depuração
    console.log(`Salvando estado com ${numCards} cards ativos`);
    
    // Chamar saveDraft e obter resultado
    const saveSuccess = saveDraft(currentState);
    
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
      // Adicionar alerta de sucesso com AlertService
      alertService.success('DRAFT_SAVED');
    } else {
      // Mostrar erro se o salvamento falhou
      alertService.error('DRAFT_SAVE_ERROR');
    }
    
    return saveSuccess;
  }, [saveCurrentState, alertService]);

  // Limpar rascunho do localStorage
  const handleClearDraft = useCallback(() => {
    const cleared = clearDraft();
    if (cleared) {
      alertService.info('DRAFT_CLEARED');
    }
    return cleared;
  }, [alertService]);

  return {
    saveCurrentState,
    handleSaveBeforeUpload,
    clearDraft: handleClearDraft
  };
};