// services/validation/validationCreateTemplate.js

/**
 * Serviço de validação específico para respostas de criação de template
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
     * @param {number} code - Código de erro
     * @param {string} description - Descrição original do erro
     * @returns {string} Mensagem de erro traduzida e formatada
     */
    translateErrorMessage: (code, description) => {
      // Mapeamento de códigos de erro para mensagens mais claras
      const errorMessages = {
        // Handles expirados
        '[81] file handle expired': 'O arquivo usado no template expirou. Faça o upload novamente.',
        '[81] file handle media': 'Erro no arquivo de mídia. Verifique se o arquivo está correto e tente novamente.',
        
        // Template já existente
        '[81] template already exists': 'Já existe um template com este nome em português. Escolha um nome diferente.',
        
        // Mensagem padrão
        'default': 'Erro desconhecido na criação do template.'
      };
  
      // Tentar encontrar uma mensagem de erro específica
      for (const [key, message] of Object.entries(errorMessages)) {
        if (description.toLowerCase().includes(key.replace(/^\[.*\]\s*/, '').toLowerCase())) {
          return message;
        }
      }
  
      // Retornar a descrição original ou uma mensagem genérica
      return description || errorMessages.default;
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
        throw new Error('Resposta da API não recebida');
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
        const errorDescription = responseData.reason?.description || 'Erro desconhecido';
  
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
      throw new Error('Resposta da API em formato inesperado');
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
    }
  };
  
  // Exportação padrão para compatibilidade
  export default TemplateCreationValidation;