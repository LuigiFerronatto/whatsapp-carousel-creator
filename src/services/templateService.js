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
    
    // Validação da chave de autorização
    if (!authKey) {
      throw new Error('A chave de autorização (Router Key) é obrigatória');
    }
    
    // Validação detalhada de cada card
    cards.forEach((card, i) => {
      // Validar texto do card
      if (!card.bodyText) {
        throw new Error(`Texto do corpo é obrigatório para o card ${i + 1}`);
      }
      
      if (card.bodyText.length > 160) {
        throw new Error(`Texto do card ${i + 1} excede o limite de 160 caracteres`);
      }
      
      // Validar file handle
      if (!card.fileHandle) {
        throw new Error(`File Handle não encontrado para o card ${i + 1}. Você deve concluir o upload na etapa anterior.`);
      }
      
      // Validar botões
      if (!card.buttons || card.buttons.length === 0) {
        throw new Error(`Adicione pelo menos um botão para o card ${i + 1}`);
      }
      
      // Validar cada botão do card
      card.buttons.forEach((button, j) => {
        if (!button.text) {
          throw new Error(`Texto do botão ${j+1} no card ${i+1} é obrigatório`);
        }
        
        if (button.text.length > 20) {
          throw new Error(`Texto do botão ${j+1} no card ${i+1} excede o limite de 20 caracteres`);
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
  
  export const formatPhoneNumber = (phoneNumber) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Verifica se o número tem um formato válido
    if (cleaned.length < 10) {
      throw new Error('Número de telefone inválido. Use formato com DDI+DDD+Número (ex: 5521999999999)');
    }
    
    return cleaned;
  };
  
  export const validateFileUpload = (cards) => {
    // Verificar se todas as URLs estão preenchidas
    cards.forEach((card, index) => {
      if (!card.fileUrl) {
        throw new Error(`URL do arquivo não informada para o card ${index + 1}`);
      }
    });
  };