// services/storage/localStorageService.js

/**
 * Salva um rascunho no localStorage com verificações de segurança
 * @param {Object} state Estado a ser salvo
 * @returns {boolean} Indica se o salvamento foi bem-sucedido
 */
export const saveDraft = (state) => {
  try {
    // Validar se o estado não está vazio
    if (!state || Object.keys(state).length === 0) {
      console.warn('Tentativa de salvar rascunho vazio');
      return false;
    }

    // Adicionar timestamp de criação
    const draftWithTimestamp = {
      ...state,
      createdAt: Date.now()
    };

    // Converter para string
    const draftString = JSON.stringify(draftWithTimestamp);

    // Verificar limite de localStorage
    try {
      localStorage.setItem('whatsapp_template_draft', draftString);
      
      // Adicionar timestamp de último salvamento
      localStorage.setItem('draft_last_saved_time', new Date().toISOString());
      
      return true;
    } catch (storageError) {
      // Tratar erros de armazenamento
      if (storageError instanceof DOMException && 
          (storageError.name === 'QuotaExceededError' || 
           storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error('Limite de armazenamento local excedido');
        // Limpar rascunhos antigos para liberar espaço
        clearOldDrafts();
      }
      return false;
    }
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
    return false;
  }
};

/**
 * Carrega o rascunho do localStorage com verificações adicionais
 * @returns {Object|null} Rascunho carregado ou null
 */
export const loadDraft = () => {
  try {
    const draftString = localStorage.getItem('whatsapp_template_draft');
    
    if (!draftString) {
      return null;
    }

    // Parse do rascunho
    const draft = JSON.parse(draftString);

    // Verificar idade do rascunho
    const MAX_DRAFT_AGE = 30 * 24 * 60 * 60 * 1000; // 30 dias
    if (draft.createdAt && (Date.now() - draft.createdAt > MAX_DRAFT_AGE)) {
      console.warn('Rascunho expirado. Removendo...');
      localStorage.removeItem('whatsapp_template_draft');
      return null;
    }

    // Filtrar e limpar campos indesejados
    const cleanDraft = {
      templateName: draft.templateName || '',
      language: draft.language || 'pt_BR',
      bodyText: draft.bodyText || '',
      cards: draft.cards && draft.cards.length >= 2 ? draft.cards : null,
      authKey: draft.authKey || '',
      lastSavedTime: draft.lastSavedTime || new Date().toISOString()
    };

    return cleanDraft;
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
    // Limpar rascunho inválido
    localStorage.removeItem('whatsapp_template_draft');
    return null;
  }
};

/**
 * Limpa rascunhos antigos do localStorage
 */
const clearOldDrafts = () => {
  try {
    // Remove todos os rascunhos relacionados ao template
    localStorage.removeItem('whatsapp_template_draft');
    localStorage.removeItem('draft_last_saved_time');
    localStorage.removeItem('last_draft_identifier');
  } catch (error) {
    console.error('Erro ao limpar rascunhos:', error);
  }
};

/**
 * Limpa completamente o rascunho atual
 */
export const clearDraft = () => {
  try {
    clearOldDrafts();
    console.log('Rascunho limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar rascunho:', error);
  }
};