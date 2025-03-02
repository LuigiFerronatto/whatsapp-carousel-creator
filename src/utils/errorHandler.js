// utils/errorHandler.js

/**
 * Catálogo centralizado de erros para a aplicação de Carrossel WhatsApp
 */
export const ERROR_CATALOG = {
  FILE_UPLOAD: {
    FAILED: {
      code: 'FILE_UPLOAD_001',
      level: 'error',
      message: 'Falha no upload do arquivo. Por favor, tente novamente.',
      recoverable: true
    },
    INVALID_TYPE: {
      code: 'FILE_UPLOAD_002',
      level: 'warning',
      message: 'Tipo de arquivo não suportado. Verifique os formatos permitidos.',
      recoverable: true
    },
    SIZE_LIMIT: {
      code: 'FILE_UPLOAD_003',
      level: 'warning',
      message: 'Tamanho do arquivo excede o limite máximo de 50MB.',
      recoverable: true
    }
  },
  API: {
    UNAUTHORIZED: {
      code: 'API_001',
      level: 'critical',
      message: 'Chave de autorização inválida. Verifique suas credenciais.',
      recoverable: true
    },
    RATE_LIMIT: {
      code: 'API_002',
      level: 'warning',
      message: 'Limite de requisições excedido. Tente novamente mais tarde.',
      recoverable: false
    }
  },
  TEMPLATE: {
    CREATION_LIMIT: {
      code: 'TEMPLATE_001',
      level: 'warning',
      message: 'Limite de templates excedido. Entre em contato com o suporte.',
      recoverable: false
    }
  }
};

/**
 * Classe personalizada de erro para a aplicação
 */
export class WhatsAppTemplateError extends Error {
  constructor(errorDetails) {
    super(errorDetails.message);
    this.name = 'WhatsAppTemplateError';
    this.details = errorDetails;
  }
}

/**
 * Manipulador de erros centralizado
 * @param {Error|WhatsAppTemplateError} error - Erro a ser processado
 * @returns {Object} Objeto com detalhes do erro para exibição
 */
export const handleApiError = (error) => {
  console.error('Erro capturado:', error);

  // Erros personalizados da aplicação
  if (error instanceof WhatsAppTemplateError) {
    return {
      type: error.details.level,
      code: error.details.code,
      message: error.details.message,
      recoverable: error.details.recoverable
    };
  }

  // Erros de resposta do servidor
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 401:
        return handleApiError(
          new WhatsAppTemplateError(ERROR_CATALOG.API.UNAUTHORIZED)
        );
      case 429:
        return handleApiError(
          new WhatsAppTemplateError(ERROR_CATALOG.API.RATE_LIMIT)
        );
      default:
        return {
          type: 'error',
          message: `Erro ${status}: ${error.response.data.message || 'Erro desconhecido'}`,
          recoverable: false
        };
    }
  }

  // Erros de conexão
  if (error.request) {
    return {
      type: 'error',
      message: 'Erro de conexão com o servidor. Verifique sua conexão com a internet.',
      recoverable: true
    };
  }

  // Outros erros
  return {
    type: 'error',
    message: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
    recoverable: false
  };
};

/**
 * Função para lançar erros personalizados
 * @param {string} errorKey - Chave do erro no catálogo
 * @throws {WhatsAppTemplateError}
 */
export const throwTemplateError = (errorKey) => {
  const [category, type] = errorKey.split('.');
  const errorDetails = ERROR_CATALOG[category][type];
  
  if (!errorDetails) {
    throw new Error('Erro não encontrado no catálogo');
  }

  throw new WhatsAppTemplateError(errorDetails);
};