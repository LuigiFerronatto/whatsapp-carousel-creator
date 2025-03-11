// hooks/template/useWhatsAppTemplate.js
import { useTemplateState } from './useTemplateState';
import { useCardManagement } from './useCardManagement';
import { useButtonManagement } from './useButtonManagement';
import { useValidation } from '../common/useValidation';
import { useDraftManager } from './useDraftManager';
import { useTemplatePersistence } from './useTemplatePersistence';
import { useStepsValidation } from './useStepsValidation';
import { useEffect } from 'react';

export const useWhatsAppTemplate = () => {
  // Estado base
  const state = useTemplateState();
  
  // Gerenciamento de cards
  const cardManagement = useCardManagement(state);
  
  // Validação
  const validation = useValidation(state);
  
  // Gerenciamento de rascunhos
  const draftManager = useDraftManager(state);
  
  // Gerenciamento de botões
  const buttonManagement = useButtonManagement(state, cardManagement);
  
  // Persistência do template
  const templatePersistence = useTemplatePersistence(state, validation, draftManager, cardManagement);
  
  // Validação de etapas
  const stepsValidation = useStepsValidation(state, validation, draftManager);

  // Limpar mensagens
  const clearMessages = () => {
    state.setError('');
    state.setSuccess('');
  };

  // Resetar o formulário para criar um novo template
  const resetForm = () => {
    // Confirmar antes de resetar
    if (window.confirm('Tem certeza que deseja criar um novo template? Os dados atuais serão perdidos.')) {
      // Limpar o rascunho salvo primeiro
      draftManager.clearDraft();
      
      // Resetar todos os estados
      state.setStep(1);
      state.setCards(Array(2).fill().map(() => state.createEmptyCard()));
      state.setNumCards(2);
      state.setTemplateName('');
      state.setBodyText('');
      state.setAuthKey('');
      state.setFinalJson({});
      state.setPhoneNumber('');
      state.setError('');
      state.setSuccess('');
      state.setValidationErrors({});
      state.setLastSavedTime(null);
      state.setUnsavedChanges(false);
      state.setUploadResults([]);
      state.setHasTriedToAdvance(false);
      
      // Reiniciar a ref de controle de carregamento do rascunho
      state.draftLoadedRef.current = false;
      
      // Mostrar alerta de reset
      setTimeout(() => {
        if (state.alert && typeof state.alert.info === 'function') {
          state.alert.info('Template resetado. Você pode começar um novo template agora.', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }
      }, 0);
    }
  };

  // Monitorar mudança de step para garantir que os fileHandles sejam preservados
  useEffect(() => {
    if (state.step === 2 && state.cards.some(card => card.fileHandle)) {
      // Salvar o estado quando avançar para o step 2 para garantir que os fileHandles sejam preservados
      draftManager.saveCurrentState();
      console.log('Estado salvo ao avançar para step 2, fileHandles preservados');
    }
  }, [state.step, state.cards, draftManager.saveCurrentState]);

  return {
    // Estados do template
    ...state,
    
    // Gerenciamento de cards
    ...cardManagement,
    
    // Gerenciamento de botões
    ...buttonManagement,
    
    // Validação
    ...validation,
    
    // Gerenciamento de rascunhos
    ...draftManager,
    
    // Persistência do template
    ...templatePersistence,
    
    // Validação de etapas
    ...stepsValidation,
    
    // Funções utilitárias
    clearMessages,
    resetForm
  };
};