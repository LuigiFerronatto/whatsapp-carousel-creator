// hooks/common/useValidation.js - Com AlertService
import { useCallback } from 'react';
import { useAlertService } from './useAlertService';

export const useValidation = (state) => {
  const { 
    setValidationErrors, 
    cards, numCards, 
    authKey, templateName, bodyText, phoneNumber,
    hasTriedToAdvance
  } = state;

  // Usar AlertService em vez de alert direto
  const alertService = useAlertService();

  // Função para exibir erros de validação
  const showValidationErrors = useCallback((errorMessages) => {
    if (!errorMessages || errorMessages.length === 0) return;
    
    // Formatação de mensagens para o alert
    const formattedErrors = errorMessages.join('\n');
    
    // Usar o AlertService para mostrar erros de validação
    alertService.error('VALIDATION_ERRORS_FOUND', {}, formattedErrors);
  }, [alertService]);
  
  // Validação do primeiro passo
  const validateStepOne = useCallback((triggerAlerts = false) => {
    // Não validar automaticamente se o usuário ainda não tentou avançar
    if (!hasTriedToAdvance && !triggerAlerts) {
      return true;
    }

    const errors = {};
    const errorMessages = [];

    // Validar a chave de autorização
    if (!authKey) {
      errors.authKey = 'A chave de autorização (Router Key) é obrigatória';
      errorMessages.push('Chave de autorização (Router Key) é obrigatória');
    }

    // Validar URLs dos arquivos apenas para os cards ativos
    cards.slice(0, numCards).forEach((card, index) => {
      if (!card.fileUrl) {
        errors[`card_${index}_fileUrl`] = `URL do arquivo não informada para o card ${index + 1}`;
        errorMessages.push(`Card ${index + 1}: URL do arquivo não informada`);
      }
    });

    // Atualizar erros de validação no estado
    setValidationErrors(errors);

    // Disparar alertas apenas se solicitado
    if (triggerAlerts && errorMessages.length > 0) {
      showValidationErrors(errorMessages);
    }

    return errorMessages.length === 0;
  }, [authKey, cards, numCards, hasTriedToAdvance, showValidationErrors, setValidationErrors]);
  
  // Validação do segundo passo
  const validateStepTwo = useCallback(() => {
    const errors = {};
    const errorMessages = [];
    
    // Validar nome do template
    if (!templateName) {
      errors.templateName = 'Nome do template é obrigatório';
      errorMessages.push('Nome do template é obrigatório');
    } else if (templateName.length < 3) {
      errors.templateName = 'Nome do template deve ter pelo menos 3 caracteres';
      errorMessages.push('Nome do template deve ter pelo menos 3 caracteres');
    }
    
    // Validar texto do corpo
    if (!bodyText) {
      errors.bodyText = 'Texto do corpo da mensagem é obrigatório';
      errorMessages.push('Texto do corpo da mensagem é obrigatório');
    } else if (bodyText.length > 1024) {
      errors.bodyText = `Texto do corpo excede o limite de 1024 caracteres. Atual: ${bodyText.length}`;
      errorMessages.push(`Texto do corpo excede o limite de 1024 caracteres (${bodyText.length})`);
    }
    
    // Validar cards
    cards.slice(0, numCards).forEach((card, index) => {
      // Validar texto do card
      if (!card.bodyText) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} é obrigatório`;
        errorMessages.push(`Card ${index + 1}: texto é obrigatório`);
      } else if (card.bodyText.length > 160) {
        errors[`card_${index}_bodyText`] = `Texto do card ${index + 1} excede o limite de 160 caracteres`;
        errorMessages.push(`Card ${index + 1}: texto excede limite de 160 caracteres`);
      }
      
      // Validar botões
      if (!card.buttons || card.buttons.length === 0) {
        errors[`card_${index}_buttons`] = `Adicione pelo menos um botão para o card ${index + 1}`;
        errorMessages.push(`Card ${index + 1}: adicione pelo menos um botão`);
      } else {
        card.buttons.forEach((button, btnIndex) => {
          // Validar texto do botão
          if (!button.text) {
            errors[`card_${index}_button_${btnIndex}_text`] = `Texto do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: texto é obrigatório`);
          }
          
          // Validar URL do botão
          if (button.type === 'URL' && !button.url) {
            errors[`card_${index}_button_${btnIndex}_url`] = `URL do botão ${btnIndex + 1} no card ${index + 1} é obrigatória`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: URL é obrigatória`);
          }
          
          // Validar número de telefone do botão
          if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
            errors[`card_${index}_button_${btnIndex}_phoneNumber`] = `Número de telefone do botão ${btnIndex + 1} no card ${index + 1} é obrigatório`;
            errorMessages.push(`Card ${index + 1}, Botão ${btnIndex + 1}: número de telefone é obrigatório`);
          }
        });
      }
    });
    
    // Atualizar erros de validação
    setValidationErrors(errors);
    
    return errorMessages.length > 0 ? errorMessages : [];
  }, [templateName, bodyText, cards, numCards, setValidationErrors]);
  
  // Validação do terceiro passo
  const validateStepThree = useCallback(() => {
    const errors = {};
    const errorMessages = [];
    
    // Validar número de telefone
    if (!phoneNumber) {
      errors.phoneNumber = 'Número de telefone é obrigatório para enviar o template';
      errorMessages.push('Número de telefone é obrigatório');
    } else {
      try {
        // Validação básica do número de telefone
        if (phoneNumber.length < 10) {
          const error = new Error('Número de telefone inválido');
          errors.phoneNumber = error.message;
          errorMessages.push(error.message);
        }
      } catch (err) {
        errors.phoneNumber = err.message;
        errorMessages.push(err.message);
      }
    }
    
    // Atualizar erros de validação
    setValidationErrors(errors);
    
    return errorMessages.length > 0 ? errorMessages : [];
  }, [phoneNumber, setValidationErrors]);
  
  // Verificar se o passo atual é válido
  const isStepValid = useCallback((currentStep, triggerAlerts = false) => {
    let errors = [];
    
    switch(currentStep) {
      case 1:
        return validateStepOne(triggerAlerts);
      case 2:
        errors = validateStepTwo();
        break;
      case 3:
        errors = validateStepThree();
        break;
      default:
        errors = [];
    }
    
    // Mostrar alertas apenas se solicitado
    if (triggerAlerts && errors.length > 0) {
      showValidationErrors(errors);
    }
    
    return errors.length === 0;
  }, [validateStepOne, validateStepTwo, validateStepThree, showValidationErrors]);

  return {
    showValidationErrors,
    validateStepOne,
    validateStepTwo,
    validateStepThree,
    isStepValid
  };
};