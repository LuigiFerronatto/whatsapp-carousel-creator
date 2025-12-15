// services/validation/validationService.js
import { ALERT_MESSAGES } from '../alert/alertService';

/**
 * Valida os dados do template antes de enviar para a API
 * Usa constantes de mensagens para compatibilidade com AlertService
 * 
 * @param {string} templateName - Nome do template
 * @param {string} bodyText - Texto do corpo da mensagem
 * @param {string} authKey - Chave de autorização da API
 * @param {Array} cards - Lista de cards do carrossel
 * @throws {Error} Lança erro se alguma validação falhar
 */
export const validateTemplate = (templateName, bodyText, authKey, cards) => {
  // Validação do nome do template
  if (!templateName) {
    throw createValidationError('TEMPLATE_NAME_REQUIRED');
  }
  
  if (templateName.length < 3) {
    throw createValidationError('TEMPLATE_NAME_SHORT');
  }
  
  // Validação do texto do corpo
  if (!bodyText) {
    throw createValidationError('TEMPLATE_BODY_REQUIRED');
  }
  
  if (bodyText.length > 1024) {
    throw createValidationError('TEMPLATE_BODY_LONG', bodyText.length);
  }
  
  // Validação da chave de autorização
  if (!authKey) {
    throw createValidationError('AUTH_KEY_REQUIRED');
  }
  
  // Validação do número de cards
  if (!cards || cards.length < 2) {
    throw createValidationError('CARD_MIN_LIMIT');
  }
  
  if (cards.length > 10) {
    throw createValidationError('CARD_MAX_LIMIT');
  }
  
  // Validação detalhada de cada card
  cards.forEach((card, i) => {
    // Validar URL do arquivo
    if (!card.fileUrl) {
      throw createValidationError('CARD_URLS_REQUIRED', i + 1);
    }
    
    // Validar texto do card
    if (!card.bodyText) {
      throw createValidationError('BUTTON_TEXT_REQUIRED', i + 1);
    }
    
    if (card.bodyText.length > 160) {
      throw createValidationError('TEMPLATE_BODY_LONG', card.bodyText.length);
    }
    
    // Validar file handle
    if (!card.fileHandle) {
      throw createValidationError('FILE_HANDLE_EXPIRED', i + 1);
    }
    
    // Validar botões
    if (!card.buttons || card.buttons.length === 0) {
      throw createValidationError('BUTTON_TEXT_REQUIRED', i + 1);
    }
    
    if (card.buttons.length > 2) {
      throw createValidationError('BUTTON_MAX_LIMIT');
    }
    
    // Validar cada botão do card
    card.buttons.forEach((button, j) => {
      if (!button.text) {
        throw createValidationError('BUTTON_TEXT_REQUIRED', j + 1, i + 1);
      }
      
      if (button.text.length > 25) {
        throw createValidationError('BUTTON_TEXT_TOO_LONG', j + 1, i + 1, button.text.length);
      }
      
      if (button.type === 'URL' && !button.url) {
        throw createValidationError('BUTTON_URL_REQUIRED', j + 1, i + 1);
      }
      
      if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
        throw createValidationError('BUTTON_PHONE_REQUIRED', j + 1, i + 1);
      }
    });
  });
};

/**
 * Valida e formata um número de telefone
 * @param {string} phoneNumber - Número de telefone a ser validado
 * @returns {string} Número de telefone formatado
 * @throws {Error} Lança erro se o número for inválido
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Remove todos os caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Verifica se o número tem um formato válido
  if (cleaned.length < 10) {
    throw createValidationError('PHONE_INVALID');
  }
  
  // Valida código do país
  const countryCode = cleaned.substring(0, 2);
  if (countryCode !== '55') {
    console.warn(`Código de país não é do Brasil: ${countryCode}`);
    // Não lançamos erro, apenas avisamos, pois pode ser um número internacional válido
  }
  
  return cleaned;
};

/**
 * Valida arquivos antes do upload
 * @param {File} file - Arquivo a ser validado
 * @throws {Error} Lança erro se o arquivo for inválido
 */
export const validateFile = (file) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 
    'image/webp', 'video/mp4', 'video/webm'
  ];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  if (!file) {
    throw createValidationError('GENERIC_ERROR', 'Nenhum arquivo foi fornecido');
  }

  if (!allowedTypes.includes(file.type)) {
    throw createValidationError('FILE_TYPE_ERROR', file.type);
  }

  if (file.size > maxFileSize) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    throw createValidationError('FILE_SIZE_ERROR', fileSize + 'MB', '50MB');
  }
};

/**
 * Valida URLs antes do upload
 * @param {string} url - URL a ser validada
 * @returns {boolean} Verdadeiro se a URL for válida
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Verifica se os cards têm URLs válidas para upload
 * @param {Array} cards - Array de cards a serem validados
 * @throws {Error} Lança erro se alguma URL for inválida
 */
export const validateFileUrls = (cards) => {
  cards.forEach((card, index) => {
    if (!card.fileUrl) {
      throw createValidationError('CARD_URLS_REQUIRED', index + 1);
    }
    
    if (!isValidUrl(card.fileUrl)) {
      throw createValidationError('CARD_URLS_INVALID', index + 1, card.fileUrl);
    }
  });
};

/**
 * Cria um erro de validação com suporte ao AlertService
 * @param {string} messageKey - Chave da mensagem em ALERT_MESSAGES
 * @param {...any} args - Argumentos para formatação da mensagem
 * @returns {Error} Erro formatado com informações para o AlertService
 */
export const createValidationError = (messageKey, ...args) => {
  // Obter a mensagem do template ou usar a chave diretamente
  const messageTemplate = ALERT_MESSAGES[messageKey] || messageKey;
  
  // Formatar a mensagem com os argumentos
  const message = formatErrorMessage(messageTemplate, ...args);
  
  // Criar o erro com informações extras
  const error = new Error(message);
  error.alertKey = messageKey;
  error.alertArgs = args;
  error.isValidationError = true;
  
  return error;
};

/**
 * Formata uma mensagem de erro substituindo tokens {0}, {1}, etc.
 * @param {string} message - Mensagem com tokens {0}, {1}, etc.
 * @param {...any} args - Valores para substituir os tokens
 * @returns {string} Mensagem formatada
 */
export const formatErrorMessage = (message, ...args) => {
  if (!message) return '';
  
  return message.replace(/{(\d+)}/g, (match, index) => {
    const argIndex = parseInt(index, 10);
    return args[argIndex] !== undefined ? args[argIndex] : match;
  });
};

/**
 * Processa um erro de validação e exibe o alerta apropriado
 * Helper para uso com AlertService
 * 
 * @param {Error} error - Erro a processar
 * @param {Object} alertService - Instância do AlertService
 * @param {Object} options - Opções adicionais para o alerta
 */
export const showValidationErrorAlert = (error, alertService, options = {}) => {
  if (!alertService) {
    console.error('AlertService não fornecido para exibir erro de validação', error);
    return;
  }
  
  // Verificar se é um erro de validação formatado
  if (error.isValidationError && error.alertKey) {
    // Usar a chave de alerta e argumentos
    alertService.error(error.alertKey, options, ...(error.alertArgs || []));
  } else {
    // Usar a mensagem do erro como texto direto
    alertService.error(error.message, options);
  }
};

// Versão compacta do serviço para export único
export const ValidationService = {
  validateTemplate,
  validatePhoneNumber,
  validateFile,
  isValidUrl,
  validateFileUrls,
  createValidationError,
  formatErrorMessage,
  showValidationErrorAlert
};

export default ValidationService;