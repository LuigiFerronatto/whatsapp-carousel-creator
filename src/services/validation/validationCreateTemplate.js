// services/validation/validationCreateTemplate.js
import { ALERT_MESSAGES } from '../alert/alertService';

/**
 * Serviço de validação específico para respostas de criação de template
 * Integrado com o AlertService para mensagens padronizadas
 */
export const TemplateCreationValidation = {
  /**
   * Códigos de erro específicos para criação de template
   */
  ERROR_CODES: {
    FILE_HANDLE_EXPIRED: 81,
    TEMPLATE_ALREADY_EXISTS: 81
  },

  /**
   * Mapeia códigos de erro para mensagens mais amigáveis
   * Usa constantes definidas em ALERT_MESSAGES quando possível
   * 
   * @param {number} code - Código de erro
   * @param {string} description - Descrição original do erro
   * @returns {string} Mensagem de erro traduzida e formatada
   */
  translateErrorMessage: (code, description) => {
    // Mapeamento de códigos de erro para chaves de mensagens
    const errorMessageKeys = {
      // Handles expirados
      '[81] file handle expired': 'O arquivo usado no template expirou. Faça o upload novamente.',
      '[81] file handle media': 'Erro no arquivo de mídia. Verifique se o arquivo está correto e tente novamente.',
      
      // Template já existente
      '[81] template already exists': ALERT_MESSAGES.TEMPLATE_EXIST_ERROR,
      
      // Mensagem padrão
      'default': ALERT_MESSAGES.GENERIC_ERROR
    };

    // Tentar encontrar uma mensagem de erro específica
    for (const [key, message] of Object.entries(errorMessageKeys)) {
      if (description.toLowerCase().includes(key.replace(/^\[.*\]\s*/, '').toLowerCase())) {
        return message;
      }
    }

    // Retornar a descrição original ou uma mensagem genérica
    return description || errorMessageKeys.default;
  },

  /**
   * Valida a resposta da criação de template
   * @param {Object} responseData - Resposta completa da API
   * @throws {Error} Lança um erro com detalhes se a criação falhar
   * @returns {Object|null} Retorna os detalhes do template se for bem-sucedido
   */
  validateTemplateCreation: (responseData) => {
    // Verificar se a resposta existe
    if (!responseData) {
      throw new Error(ALERT_MESSAGES.GENERIC_ERROR);
    }

    // Verificar status da resposta
    if (responseData.status === 'success') {
      // Criação bem-sucedida
      return {
        templateId: responseData.resource?.id,
        status: 'success'
      };
    }

    // Se o status for failure, processar o erro
    if (responseData.status === 'failure') {
      const errorCode = responseData.reason?.code;
      const errorDescription = responseData.reason?.description || ALERT_MESSAGES.GENERIC_ERROR;

      // Traduzir a mensagem de erro
      const translatedMessage = TemplateCreationValidation.translateErrorMessage(
        errorCode, 
        errorDescription
      );

      // Criar erro detalhado
      const detailedError = new Error(translatedMessage);
      detailedError.code = errorCode;
      detailedError.originalDescription = errorDescription;
      detailedError.originalResponse = responseData;
      
      // Adicionar chave de alerta para o AlertService
      // Isso permite que componentes determinem qual alerta mostrar
      detailedError.alertKey = TemplateCreationValidation.getAlertKeyForError(errorCode, errorDescription);

      // Log adicional para diferentes tipos de erros
      switch (errorCode) {
        case TemplateCreationValidation.ERROR_CODES.FILE_HANDLE_EXPIRED:
          console.warn('Template Creation - File Handle Expired:', {
            code: errorCode,
            description: errorDescription
          });
          break;

        case TemplateCreationValidation.ERROR_CODES.TEMPLATE_ALREADY_EXISTS:
          console.warn('Template Creation - Template Already Exists:', {
            code: errorCode,
            description: errorDescription
          });
          break;

        default:
          console.error('Unhandled Template Creation Error:', {
            code: errorCode,
            description: errorDescription
          });
      }

      // Lançar erro detalhado
      throw detailedError;
    }

    // Caso improvável, mas para garantir
    throw new Error(ALERT_MESSAGES.GENERIC_ERROR);
  },

  /**
   * Obtém a chave de alerta apropriada para um erro
   * Facilita o uso com o AlertService
   * 
   * @param {number} code - Código de erro
   * @param {string} description - Descrição do erro
   * @returns {string} Chave de alerta para o erro
   */
  getAlertKeyForError: (code, description) => {
    const desc = description.toLowerCase();
    
    if (code === TemplateCreationValidation.ERROR_CODES.TEMPLATE_ALREADY_EXISTS && 
        desc.includes('already exists')) {
      return 'TEMPLATE_EXIST_ERROR';
    }
    
    if (code === TemplateCreationValidation.ERROR_CODES.FILE_HANDLE_EXPIRED && 
        desc.includes('file handle expired')) {
      return 'FILE_HANDLE_EXPIRED';
    }
    
    return 'TEMPLATE_CREATION_ERROR';
  },

  /**
   * Verifica se um erro é relacionado a handle de arquivo expirado
   * @param {Error} error - Erro a ser verificado
   * @returns {boolean} Se o erro está relacionado a handle expirado
   */
  isFileHandleExpiredError: (error) => {
    return error.code === TemplateCreationValidation.ERROR_CODES.FILE_HANDLE_EXPIRED && 
           error.originalDescription.toLowerCase().includes('file handle expired');
  },

  /**
   * Verifica se um erro é relacionado a template já existente
   * @param {Error} error - Erro a ser verificado
   * @returns {boolean} Se o erro está relacionado a template duplicado
   */
  isTemplateAlreadyExistsError: (error) => {
    return error.code === TemplateCreationValidation.ERROR_CODES.TEMPLATE_ALREADY_EXISTS && 
           error.originalDescription.toLowerCase().includes('already exists');
  },
  
  /**
   * Processa um erro e exibe o alerta apropriado
   * Helper para uso com AlertService
   * 
   * @param {Error} error - Erro a processar
   * @param {Object} alertService - Instância do AlertService
   * @param {Object} options - Opções adicionais para o alerta
   */
  showErrorAlert: (error, alertService, options = {}) => {
    if (!alertService) {
      console.error('AlertService não fornecido para exibir erro', error);
      return;
    }
    
    // Determinar a chave de alerta e parâmetros adicionais
    if (error.alertKey) {
      // Usar a chave já determinada
      alertService.error(error.alertKey, options);
    } else if (TemplateCreationValidation.isTemplateAlreadyExistsError(error)) {
      alertService.error('TEMPLATE_EXIST_ERROR', options);
    } else if (TemplateCreationValidation.isFileHandleExpiredError(error)) {
      alertService.error(error.message, options);
    } else {
      // Usar a chave genérica com a mensagem como parâmetro
      alertService.error('TEMPLATE_CREATION_ERROR', options, error.message || 'Erro desconhecido');
    }
  }
};

// Exportação padrão para compatibilidade
export default TemplateCreationValidation;