// hooks/template/useTemplateCreation.js
import { useState, useCallback } from 'react';
import { useAlertService } from '../common/useAlertService';
import { TemplateCreationValidation } from '../../services/validation/validationCreateTemplate';
import { ValidationService } from '../../services/validation/validationService';
import { createTemplateApi } from '../../services/api/templateService';

/**
 * Hook que gerencia a criação de templates com integração do AlertService
 * Inclui validação completa e tratamento de erros padronizado
 */
export const useTemplateCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  
  // Inicializar o sistema de alertas
  const alert = useAlertService();
  
  /**
   * Função para criar um novo template
   * Inclui validação, alertas e tratamento de erros padronizado
   * 
   * @param {Object} templateData - Dados do template a ser criado
   * @returns {Object} Resultado da criação (templateId e status)
   */
  const createTemplate = useCallback(async (templateData) => {
    // Resetar estados
    setIsLoading(true);
    setError(null);
    setTemplateId(null);
    
    try {
      // Extrair dados para validação
      const { templateName, bodyText, authKey, cards } = templateData;
      
      // Executar validação completa
      ValidationService.validateTemplate(templateName, bodyText, authKey, cards);
      
      // Validar URLs dos arquivos
      ValidationService.validateFileUrls(cards);
      
      // Mostrar alerta de processamento
      alert.info("Processando template...", {
        position: 'top-center',
        autoCloseTime: false,
        id: 'create-template-processing'
      });
      
      // Fazer chamada à API
      const response = await createTemplateApi(templateData);
      
      // Validar resposta da API
      const result = TemplateCreationValidation.validateTemplateCreation(response);
      
      // Remover alerta de processamento
      alert.remove('create-template-processing');
      
      // Mostrar alerta de sucesso
      alert.success("TEMPLATE_CREATED", {
        position: 'top-right',
        autoCloseTime: 3000
      });
      
      // Atualizar estado com resultado
      setTemplateId(result.templateId);
      
      return result;
    } catch (error) {
      // Remover alerta de processamento se existir
      alert.remove('create-template-processing');
      
      // Atualizar estado de erro
      setError(error);
      
      // Identificar tipo de erro e mostrar alerta apropriado
      if (error.isValidationError) {
        // Erro de validação local
        ValidationService.showValidationErrorAlert(error, alert, {
          position: 'top-center',
          autoCloseTime: 7000
        });
      } else if (error.code) {
        // Erro da API de criação de template
        TemplateCreationValidation.showErrorAlert(error, alert, {
          position: 'top-center',
          autoCloseTime: 7000
        });
      } else {
        // Erro genérico
        alert.error("GENERIC_ERROR", {
          position: 'top-center',
          autoCloseTime: 7000
        });
        
        // Log adicional para erros não tratados
        console.error("Erro não tratado em createTemplate:", error);
      }
      
      // Re-lançar erro para tratamento adicional se necessário
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [alert]);
  
  /**
   * Função para enviar um template para um número de telefone
   * 
   * @param {string} templateId - ID do template a ser enviado
   * @param {string} phoneNumber - Número de telefone de destino
   * @returns {Object} Resultado do envio
   */
  const sendTemplate = useCallback(async (templateId, phoneNumber) => {
    setIsLoading(true);
    
    try {
      // Validar número de telefone
      const validatedPhone = ValidationService.validatePhoneNumber(phoneNumber);
      
      // Mostrar alerta de processamento
      alert.info("Enviando template...", {
        position: 'top-center',
        autoCloseTime: false,
        id: 'send-template-processing'
      });
      
      // TODO: Implementar chamada à API de envio
      const sendResult = { success: true }; // Simulação
      
      // Remover alerta de processamento
      alert.remove('send-template-processing');
      
      // Mostrar alerta de sucesso
      alert.success("TEMPLATE_SENT", {
        position: 'top-right',
        autoCloseTime: 3000
      }, validatedPhone);
      
      return sendResult;
    } catch (error) {
      // Remover alerta de processamento
      alert.remove('send-template-processing');
      
      // Atualizar estado de erro
      setError(error);
      
      // Mostrar alerta de erro apropriado
      if (error.isValidationError) {
        ValidationService.showValidationErrorAlert(error, alert, {
          position: 'top-center',
          autoCloseTime: 5000
        });
      } else {
        alert.error("TEMPLATE_SEND_ERROR", {
          position: 'top-center',
          autoCloseTime: 5000
        }, error.message || 'Erro desconhecido');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [alert]);
  
  /**
   * Limpa os erros e estados do hook
   */
  const clearErrors = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    createTemplate,
    sendTemplate,
    clearErrors,
    isLoading,
    error,
    templateId
  };
};

export default useTemplateCreation;