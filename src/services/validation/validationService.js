// services/validation/validationService.js

/**
 * Valida os dados do template antes de enviar para a API
 * @param {string} templateName - Nome do template
 * @param {string} bodyText - Texto do corpo da mensagem
 * @param {string} authKey - Chave de autorização da API
 * @param {Array} cards - Lista de cards do carrossel
 * @throws {Error} Lança erro se alguma validação falhar
 */
export const validateTemplate = (templateName, bodyText, authKey, cards) => {
  // Validação do nome do template
  if (!templateName) {
    throw new Error('Nome do template é obrigatório');
  }
  
  if (templateName.length < 3) {
    throw new Error('Nome do template deve ter pelo menos 3 caracteres');
  }
  
  // Validação do texto do corpo
  if (!bodyText) {
    throw new Error('Texto do corpo da mensagem é obrigatório');
  }
  
  if (bodyText.length > 1024) {
    throw new Error(`Texto do corpo excede o limite de 1024 caracteres. Atual: ${bodyText.length}`);
  }
  
  // Validação da chave de autorização
  if (!authKey) {
    throw new Error('A chave de autorização (Router Key) é obrigatória');
  }
  
  // Validação do número de cards
  if (!cards || cards.length < 2) {
    throw new Error('É necessário pelo menos 2 cards para criar um carrossel');
  }
  
  if (cards.length > 10) {
    throw new Error('O carrossel pode ter no máximo 10 cards');
  }
  
  // Validação detalhada de cada card
  cards.forEach((card, i) => {
    // Validar URL do arquivo
    if (!card.fileUrl) {
      throw new Error(`URL do arquivo é obrigatória para o card ${i + 1}`);
    }
    
    // Validar texto do card
    if (!card.bodyText) {
      throw new Error(`Texto do corpo é obrigatório para o card ${i + 1}`);
    }
    
    if (card.bodyText.length > 160) {
      throw new Error(`Texto do card ${i + 1} excede o limite de 160 caracteres. Atual: ${card.bodyText.length}`);
    }
    
    // Validar file handle
    if (!card.fileHandle) {
      throw new Error(`File Handle não encontrado para o card ${i + 1}. Você deve concluir o upload na etapa anterior.`);
    }
    
    // Validar botões
    if (!card.buttons || card.buttons.length === 0) {
      throw new Error(`Adicione pelo menos um botão para o card ${i + 1}`);
    }
    
    if (card.buttons.length > 2) {
      throw new Error(`O card ${i + 1} pode ter no máximo 2 botões`);
    }
    
    // Validar cada botão do card
    card.buttons.forEach((button, j) => {
      if (!button.text) {
        throw new Error(`Texto do botão ${j+1} no card ${i+1} é obrigatório`);
      }
      
      if (button.text.length > 25) {
        throw new Error(`Texto do botão ${j+1} no card ${i+1} excede o limite de 25 caracteres. Atual: ${button.text.length}`);
      }
      
      if (button.type === 'URL' && !button.url) {
        throw new Error(`URL do botão ${j+1} no card ${i+1} é obrigatório`);
      }
      
      if (button.type === 'PHONE_NUMBER' && !button.phoneNumber) {
        throw new Error(`Número de telefone do botão ${j+1} no card ${i+1} é obrigatório`);
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
    throw new Error('Número de telefone inválido. Use formato com DDI+DDD+Número (ex: 5521999999999)');
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
    throw new Error('Nenhum arquivo foi fornecido');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de arquivo não suportado: ${file.type}. Tipos permitidos: JPEG, PNG, GIF, WebP, MP4, WebM`);
  }

  if (file.size > maxFileSize) {
    throw new Error(`Tamanho do arquivo excede o limite de 50MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
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
      throw new Error(`URL do arquivo não informada para o card ${index + 1}`);
    }
    
    if (!isValidUrl(card.fileUrl)) {
      throw new Error(`URL inválida para o card ${index + 1}: ${card.fileUrl}`);
    }
  });
};