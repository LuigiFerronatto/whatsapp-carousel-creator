
// hooks/template/useStepsValidation.js
import { useCallback } from 'react';

export const useStepsValidation = (state, validation, draftManager) => {
  const {
    setStep, setHasTriedToAdvance, setError,
    alert
  } = state;

  const { validateStepOne, isStepValid } = validation;
  const { saveCurrentState } = draftManager;

  // Avançar para o próximo passo com validação
  const handleNextStep = useCallback(() => {
    setHasTriedToAdvance(true); // Marcar que o usuário tentou avançar
    const isValid = validateStepOne(true); // Forçar validação com alertas
    if (isValid) {
      // Salvar o estado atual antes de avançar
      saveCurrentState();
      setStep((prev) => prev + 1); // Avançar para o próximo passo
    }
  }, [validateStepOne, saveCurrentState, setHasTriedToAdvance, setStep]);

  // Ir para o passo anterior
  const goToPreviousStep = useCallback(() => {
    if (state.step > 1) {
      // Salvar o estado atual antes de voltar ao passo anterior
      // Isso é crucial para preservar os fileHandles entre passos
      saveCurrentState();
      
      setStep(prev => prev - 1);
      setError('');
      
      // Mostrar alerta de navegação
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Retornando para o passo ${state.step - 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    }
  }, [state.step, saveCurrentState, setStep, setError, alert]);

  // Atualizar campos de texto com limpeza de validação
  const handleInputChange = useCallback((field, value) => {
    state.setHasInteracted(true); // Marcar que o usuário interagiu
    
    // Atualizar o campo apropriado
    switch (field) {
      case 'authKey':
        state.setAuthKey(value);
        break;
      case 'templateName':
        state.setTemplateName(value);
        break;
      case 'bodyText':
        state.setBodyText(value);
        break;
      case 'phoneNumber':
        state.setPhoneNumber(value);
        break;
      default:
        break;
    }
    
    // Marcar alterações não salvas
    state.setUnsavedChanges(true);
    
    // Limpar erros de validação relacionados ao campo
    if (state.validationErrors[field]) {
      state.setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [state]);

  return {
    handleNextStep,
    goToPreviousStep,
    handleInputChange
  };
};